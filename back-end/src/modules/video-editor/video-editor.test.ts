import { describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
import { createApp } from "../../app";

// Mock services to prevent external calls during tests
jest.mock("./video-editor.service", () => {
  return {
    VideoEditorService: {
      getInstance: () => ({
        startDownload: jest.fn().mockImplementation(() => Promise.resolve("mocked_task_id")),
        startExport: jest.fn().mockImplementation(() => Promise.resolve()),
        getTask: jest.fn().mockImplementation((id) => {
          if (id === "valid_id") {
            return Promise.resolve({
              id: "valid_id",
              url: "https://youtube.com/watch?v=123",
              status: "downloaded",
              progress: 100,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          return Promise.resolve(null);
        }),
      }),
    },
  };
});

describe("Video Editor Routes", () => {
  const app = createApp();

  describe("POST /api/video/download", () => {
    it("returns 400 when url is missing", async () => {
      const res = await request(app)
        .post("/api/video/download")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("YouTube URL is required");
    });

    it("returns 400 when url format is invalid", async () => {
      const res = await request(app)
        .post("/api/video/download")
        .send({ url: "invalid_link" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid YouTube URL format");
    });

    it("returns 202 accepted when download request is valid", async () => {
      const res = await request(app)
        .post("/api/video/download")
        .send({ url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.data.taskId).toBeDefined();
    });
  });

  describe("POST /api/video/export", () => {
    it("returns 400 when taskId or clips is missing", async () => {
      const res = await request(app)
        .post("/api/video/export")
        .send({ taskId: "some_id" }); // clips missing

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("clip selection is required");
    });

    it("returns 400 when clips array is empty", async () => {
      const res = await request(app)
        .post("/api/video/export")
        .send({ taskId: "some_id", clips: [] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("clip selection is required");
    });

    it("returns 400 when transition duration exceeds clip duration", async () => {
      const res = await request(app)
        .post("/api/video/export")
        .send({
          taskId: "some_id",
          clips: [
            { start: 0, end: 5, transition: { type: "fade", duration: 6 } }, // transition 6 > clip 5
            { start: 10, end: 20, transition: { type: "none", duration: 1 } },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("cannot be longer than clip duration");
    });
    it("returns 400 when transition duration exceeds next clip duration", async () => {
      const res = await request(app)
        .post("/api/video/export")
        .send({
          taskId: "some_id",
          clips: [
            { start: 0, end: 10, transition: { type: "fade", duration: 6 } }, // transition is 6s
            { start: 15, end: 20, transition: { type: "none", duration: 1 } }, // next clip is only 5s
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("cannot be longer than the next clip's duration");
    });

    it("returns 400 when the last clip has a transition", async () => {
      const res = await request(app)
        .post("/api/video/export")
        .send({
          taskId: "some_id",
          clips: [
            { start: 0, end: 10, transition: { type: "none", duration: 1 } },
            { start: 15, end: 25, transition: { type: "fade", duration: 1 } }, // last clip has fade transition
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("last clip cannot have a transition");
    });
    it("returns 202 accepted when export request is valid", async () => {
      const res = await request(app)
        .post("/api/video/export")
        .send({
          taskId: "valid_id",
          clips: [
            { start: 0, end: 10, transition: { type: "fade", duration: 1 } },
            { start: 15, end: 25, transition: { type: "none", duration: 1 } },
          ],
        });

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/video/status/:taskId", () => {
    it("returns 404 when taskId does not exist", async () => {
      const res = await request(app).get("/api/video/status/non_existent_id");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Task not found");
    });

    it("returns 200 with task status when taskId exists", async () => {
      const res = await request(app).get("/api/video/status/valid_id");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe("valid_id");
      expect(res.body.data.status).toBe("downloaded");
    });
  });
});
