import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import app from "../../app.js";
import { User } from "../../models/User.js";

const { DB_TEST_HOST, PORT = 3000, JWT_SECRET } = process.env;

describe("test /users/login route", () => {
  let server = null;
  const userData = {
    email: "user@gmail.com",
    password: "qwerty123",
  };

  beforeAll(async () => {
    await mongoose.connect(DB_TEST_HOST);

    server = app.listen(PORT);
  });

  afterAll(async () => {
    await mongoose.connection.close();

    server.close();
  });

  beforeEach(async () => {
    await request(app).post("/users/register").send(userData);
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  test("test /users/login status code with correct data", async () => {
    const { statusCode } = await request(app)
      .post("/users/login")
      .send(userData);

    expect(statusCode).toBe(200);
  });

  test("test /users/login with correct email", async () => {
    const user = await User.findOne({ "user.email": userData.email });

    expect(user).toBeTruthy();
  });

  test("test /users/login for presence token with correct data", async () => {
    await request(app).post("/users/login").send(userData);

    const user = await User.findOne({ "user.email": userData.email });

    expect(user.token).toBeTruthy();
  });

  test("test /users/login for valid token with correct data", async () => {
    await request(app).post("/users/login").send(userData);

    const user = await User.findOne({ "user.email": userData.email });

    const { id } = jwt.verify(user.token, JWT_SECRET);
    const userById = await User.findById(id);

    expect(userById).toBeTruthy();
    expect(userById.user.email).toBe(userData.email);
  });

  test("test /users/login for compliance with User model with correct data", async () => {
    const user = await User.findOne({ "user.email": userData.email });

    expect(user).toBeInstanceOf(User);
  });

  test("test /users/login for valid password with correct data", async () => {
    const user = await User.findOne({ "user.email": userData.email });

    const comparePassword = await bcrypt.compare(
      userData.password,
      user.user.password
    );

    expect(comparePassword).toBeTruthy();
  });

  test("test /users/login with correct data", async () => {
    const { body, statusCode } = await request(app)
      .post("/users/login")
      .send(userData);

    expect(statusCode).toBe(200);
    expect(body.user.email).toBe(userData.email);

    const user = await User.findOne({ "user.email": userData.email });

    expect(user.user.email).toBe(userData.email);
    expect(user).toBeInstanceOf(User);
    expect(user.token).toBeTruthy();

    const { id } = jwt.verify(user.token, JWT_SECRET);
    const userById = await User.findById(id);

    expect(userById).toBeTruthy();
    expect(userById.user.email).toBe(userData.email);

    const comparePassword = await bcrypt.compare(
      userData.password,
      user.user.password
    );

    expect(comparePassword).toBeTruthy();
  });
});
