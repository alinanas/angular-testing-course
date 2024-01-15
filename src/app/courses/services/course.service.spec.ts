import { TestBed } from "@angular/core/testing";
import {
  HttpTestingController,
  HttpClientTestingModule,
} from "@angular/common/http/testing";
import { CoursesService } from "./courses.service";
import { COURSES, findLessonsForCourse } from "../../../../server/db-data";
import { HttpErrorResponse } from "@angular/common/http";

describe("CourseService", () => {
  let courseService: CoursesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CoursesService],
    });

    courseService = TestBed.inject(CoursesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it("should retrieve all courses", () => {
    courseService.findAllCourses().subscribe((courses) => {
      expect(courses).toBeTruthy("No courses returned");
      expect(courses.length).toBe(12, "Incorrect number of courses");

      const course12 = courses.find((course) => course.id === 12);
      expect(course12.titles.description).toBe("Angular Testing Course");
    });

    const req = httpMock.expectOne("/api/courses");
    expect(req.request.method).toBe("GET");

    req.flush({ payload: Object.values(COURSES) });
  });

  it("should retrieve a course by id", () => {
    courseService.findCourseById(12).subscribe((course) => {
      expect(course).toBeTruthy("No course returned");
      expect(course.id).toBe(12);
    });

    const req = httpMock.expectOne("/api/courses/12");
    expect(req.request.method).toBe("GET");

    req.flush(COURSES[12]);
  });

  it("should save the course data", () => {
    const data = {
      titles: { description: "Testing Course" },
    };

    courseService.saveCourse(12, data).subscribe((course) => {
      expect(course.id).toBe(12);
    });

    const req = httpMock.expectOne("/api/courses/12");
    expect(req.request.method).toBe("PUT");
    expect(req.request.body.titles.description).toBe(data.titles.description);
    req.flush({ ...COURSES[12], ...data });
  });

  it("should throw an error if save course fails", () => {
    const data = {
      titles: { description: "Testing Course" },
    };

    courseService.saveCourse(12, data).subscribe(
      () => fail("the save operation should have failed"),
      (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
      }
    );
    const req = httpMock.expectOne("/api/courses/12");
    expect(req.request.method).toBe("PUT");
    req.flush("Saved request failed", {
      status: 500,
      statusText: "Something went wrong",
    });
  });

  it("should find a list of lessons", () => {
    courseService.findLessons(12).subscribe((lessons) => {
      expect(lessons).toBeTruthy();
      expect(lessons.length).toBe(3);
    });

    const req = httpMock.expectOne((req) => req.url === "/api/lessons");
    expect(req.request.method).toBe("GET");
    expect(req.request.params.get("courseId")).toBe("12");
    expect(req.request.params.get("filter")).toBe("");
    expect(req.request.params.get("sortOrder")).toBe("asc");
    expect(req.request.params.get("pageNumber")).toBe("0");
    expect(req.request.params.get("pageSize")).toBe("3");

    req.flush({
      payload: findLessonsForCourse(12).slice(0, 3),
    });
  });
});
