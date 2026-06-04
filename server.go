package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/static"
	"github.com/redis/go-redis/v9"
	"crypto/tls"

	// "gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var rdb *redis.Client
var ctx = context.Background()

// ─── Models ─────────────────────────────────────────────────────────────────

type Student struct {
	ID      uint   `json:"id" gorm:"primaryKey"`
	Name    string `json:"name"`
	Age     int    `json:"age"`
	ClassID int    `json:"class_id"`
	Marks   int    `json:"marks"`
	Present int    `json:"present"`
}

type Class struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name"`
}

func startKeepAlive(serverURL string) {
	ticker := time.NewTicker(14 * time.Minute)
	go func() {
		for range ticker.C {
			resp, err := http.Get(serverURL + "/ping")
			if err != nil {
				log.Println("[keep-alive] ping error:", err)
			} else {
				resp.Body.Close()
				log.Println("[keep-alive] ping ok:", resp.StatusCode)
			}
		}
	}()
}

func invalidateStudentCache() {
	if rdb == nil {
		return
	}
	rdb.Del(ctx, "students:all", "stats")
}

func invalidateClassCache() {
	if rdb == nil {
		return
	}
	rdb.Del(ctx, "classes:all", "stats")
}

func main() {
	godotenv.Load()

	// ─── Database ────────────────────────────────────────────────────────────
	dsn := os.Getenv("DATABASE_URL")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	fmt.Println("Database connected!")

	db.AutoMigrate(&Class{}, &Student{})

	// ─── Redis ───────────────────────────────────────────────────────────────
	redisURL := os.Getenv("REDIS_URL")
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatal("Failed to parse Redis URL:", err)
	}

	// Force TLS for Upstash
	opt.TLSConfig = &tls.Config{
		InsecureSkipVerify: true,
	}

	rdb = redis.NewClient(opt)
	rdb = redis.NewClient(opt)
	if _, err := rdb.Ping(ctx).Result(); err != nil {
		log.Println("[redis] warning: could not connect to Redis:", err)
		log.Println("[redis] continuing without cache...")
		rdb = nil
	} else {
		fmt.Println("Redis connected!")
	}

	// ─── App ─────────────────────────────────────────────────────────────────
	app := fiber.New()
	app.Use(cors.New())

	app.Get("/ping", func(c fiber.Ctx) error {
		return c.SendString("pong")
	})

	startKeepAlive(os.Getenv("RENDER_EXTERNAL_URL"))

	// ═══════════════════════ CLASS ROUTES ════════════════════════════════════

	// ====================Read Classes=======================
	app.Get("/classes", func(c fiber.Ctx) error {
		if rdb != nil {
			cached, err := rdb.Get(ctx, "classes:all").Result()
			if err == nil {
				c.Set("Content-Type", "application/json")
				return c.SendString(cached)
			}
		}

		var classes []Class
		result := db.Find(&classes)
		if result.Error != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": result.Error.Error(),
			})
		}

		if rdb != nil {
			if data, err := json.Marshal(classes); err == nil {
				rdb.Set(ctx, "classes:all", string(data), 30*time.Second)
			}
		}

		return c.JSON(classes)
	})

	// ===================Create Class===================
	app.Post("/classes", func(c fiber.Ctx) error {
		var newClass Class
		if err := c.Bind().Body(&newClass); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid input",
			})
		}
		var existing Class
		db.Where("name = ?", newClass.Name).First(&existing)

		if existing.ID != 0 {
			return c.JSON(existing)
		}
		db.Create(&newClass)

		invalidateClassCache()

		return c.JSON(newClass)
	})

	// ===================Delete Class====================
	app.Delete("/classes/:id", func(c fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid ID format",
			})
		}

		var class Class
		result := db.First(&class, id)
		if result.Error != nil {
			return c.Status(404).JSON(fiber.Map{
				"error": "Class not found",
			})
		}

		db.Delete(&Class{}, id)

		invalidateClassCache()

		return c.SendString("Deleted")
	})

	// ═══════════════════════ STUDENT ROUTES ══════════════════════════════════

	// =================Create Student=================
	app.Post("/students", func(c fiber.Ctx) error {
		var newStudent Student
		if err := c.Bind().Body(&newStudent); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid input",
			})
		}
		db.Create(&newStudent)

		invalidateStudentCache()

		return c.JSON(newStudent)
	})

	// =================Read Students================
	app.Get("/students", func(c fiber.Ctx) error {
		if rdb != nil {
			cached, err := rdb.Get(ctx, "students:all").Result()
			if err == nil {
				c.Set("Content-Type", "application/json")
				return c.SendString(cached)
			}
		}

		var students []Student
		result := db.Find(&students)
		if result.Error != nil {
			return c.Status(500).JSON(fiber.Map{
				"error": result.Error.Error(),
			})
		}

		if rdb != nil {
			if data, err := json.Marshal(students); err == nil {
				rdb.Set(ctx, "students:all", string(data), 30*time.Second)
			}
		}

		return c.Status(200).JSON(students)
	})

	// ================Read with filtered=================
	app.Get("/students/filtered", func(c fiber.Ctx) error {
		name := c.Query("name")
		classID := c.Query("class_id")
		marks := c.Query("marks")
		present := c.Query("present")

		query := db.Model(&Student{})

		if name != "" {
			query = query.Where("name LIKE ?", "%"+name+"%")
		}
		if classID != "" {
			query = query.Where("class_id = ?", classID)
		}
		if marks != "" {
			query = query.Where("marks >= ?", marks)
		}
		if present != "" {
			query = query.Where("present >= ?", present)
		}

		var students []Student
		query.Find(&students)

		return c.JSON(students)
	})

	// ===================Get Single Student=============
	app.Get("/students/:id", func(c fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid ID format",
			})
		}
		var student Student
		db.First(&student, id)
		return c.JSON(student)
	})

	// ===================Update Student==================
	app.Put("/students/:id", func(c fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid ID format",
			})
		}
		var student Student
		result := db.First(&student, id)
		if result.Error != nil {
			return c.Status(404).JSON(fiber.Map{
				"Error": "Data Not found",
			})
		}
		var updatedStudent Student
		if err := c.Bind().Body(&updatedStudent); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"Error": "Invalid Input",
			})
		}
		student.Name = updatedStudent.Name
		student.Age = updatedStudent.Age
		student.Marks = updatedStudent.Marks
		student.ClassID = updatedStudent.ClassID
		student.Present = updatedStudent.Present

		db.Save(&student)

		invalidateStudentCache()

		return c.JSON(student)
	})

	// =================Delete Student================
	app.Delete("/students/:id", func(c fiber.Ctx) error {
		id, err := strconv.Atoi(c.Params("id"))
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid ID format",
			})
		}
		var student Student
		result := db.Delete(&student, id)
		if result.Error != nil {
			return c.Status(404).JSON(fiber.Map{
				"Error": "Data Not found",
			})
		}

		invalidateStudentCache()

		return c.SendString("Student Deleted")
	})

	// =============Delete Student with ClassId===============
	app.Delete("/students/class/:id", func(c fiber.Ctx) error {
		classId := c.Params("id")
		db.Where("class_id = ?", classId).Delete(&Student{})

		invalidateStudentCache()

		return c.JSON(fiber.Map{
			"message": "students deleted",
		})
	})

	// ═══════════════════════ STATS ═══════════════════════════════════════════

	app.Get("/stats", func(c fiber.Ctx) error {
		if rdb != nil {
			cached, err := rdb.Get(ctx, "stats").Result()
			if err == nil {
				c.Set("Content-Type", "application/json")
				return c.SendString(cached)
			}
		}

		var totalStudents int64
		var totalClasses int64
		var avgMarks float64
		var avgPresent float64
		var totalPresent int64

		db.Model(&Student{}).Count(&totalStudents)
		db.Model(&Class{}).Count(&totalClasses)
		db.Model(&Student{}).Select("AVG(marks)").Scan(&avgMarks)
		db.Model(&Student{}).Select("AVG(present)").Scan(&avgPresent)
		db.Model(&Student{}).Select("SUM(present)").Scan(&totalPresent)

		stats := fiber.Map{
			"total_students": totalStudents,
			"total_classes":  totalClasses,
			"avg_marks":      avgMarks,
			"avg_present":    avgPresent,
			"total_present":  totalPresent,
		}

		if rdb != nil {
			if data, err := json.Marshal(stats); err == nil {
				rdb.Set(ctx, "stats", string(data), 5*time.Minute)
			}
		}

		return c.JSON(stats)
	})

	app.Use("/", static.New("./public"))
	app.Listen(":5000")
}
