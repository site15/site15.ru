import axios from "axios";
import { randomUUID } from "crypto";

describe("[SUCCESS] Contact type (e2e)", () => {
  const idOfCreatedItems: number[] = [];

  afterAll(async () => {
    for (let id of idOfCreatedItems) {
      await axios.delete(`${process.env.PROJECT_URL}/api/contact-types/${id}`);
    }
  });

  it("Get contact types", async () => {
    const createdItems = await Promise.all([
      await axios.post(`${process.env.PROJECT_URL}/api/contact-types/`, {
        name: String(randomUUID() + Date()),
        title: String(randomUUID() + Date()),
        title_ru: String(randomUUID() + Date()),
      }),
      await axios.post(`${process.env.PROJECT_URL}/api/contact-types/`, {
        name: String(randomUUID() + Date()),
        title: String(randomUUID() + Date()),
        title_ru: String(randomUUID() + Date()),
      }),
      await axios.post(`${process.env.PROJECT_URL}/api/contact-types/`, {
        name: String(randomUUID() + Date()),
        title: String(randomUUID() + Date()),
        title_ru: String(randomUUID() + Date()),
      }),
    ]);

    idOfCreatedItems.push(
      createdItems[0].data.id,
      createdItems[1].data.id,
      createdItems[2].data.id
    );

    const result = await axios.get(
      `${process.env.PROJECT_URL}/api/contact-types`
    );
    expect(result.data).toEqual(
      expect.arrayContaining([
        createdItems[0].data,
        createdItems[1].data,
        createdItems[2].data,
      ])
    );
  });

  it("Get contact type by id", async () => {
    const createdItem = await axios.post(
      `${process.env.PROJECT_URL}/api/contact-types/`,
      {
        name: String(randomUUID() + Date()),
        title: String(randomUUID() + Date()),
        title_ru: String(randomUUID() + Date()),
      }
    );

    const id = createdItem.data.id;
    idOfCreatedItems.push(id);

    const result = await axios.get(
      `${process.env.PROJECT_URL}/api/contact-types/${id}`
    );

    expect(result.data.id).toEqual(id);
    expect(result.data).toEqual(createdItem.data);
  });

  it("Post create contact type", async () => {
    const createdItem = await axios.post(
      `${process.env.PROJECT_URL}/api/contact-types/`,
      {
        name: String(randomUUID() + Date()),
        title: String(randomUUID() + Date()),
        title_ru: String(randomUUID() + Date()),
      }
    );

    const id = createdItem.data.id;
    idOfCreatedItems.push(id);

    const result = await axios.get(
      `${process.env.PROJECT_URL}/api/contact-types/${id}`
    );

    expect(result.data.id).toEqual(id);
    expect(result.data).toEqual(createdItem.data);
  });

  it("Put update contact type by id", async () => {
    const createdItem = await axios.post(
      `${process.env.PROJECT_URL}/api/contact-types/`,
      {
        name: String(randomUUID() + Date()),
        title: String(randomUUID() + Date()),
        title_ru: String(randomUUID() + Date()),
      }
    );

    const id = createdItem.data.id;
    idOfCreatedItems.push(id);

    const updatedItem = await axios.put(
      `${process.env.PROJECT_URL}/api/contact-types/${id}`,
      {
        name: String(randomUUID() + Date()),
        title: String(randomUUID() + Date()),
        title_ru: String(randomUUID() + Date()),
      }
    );

    const result = await axios.get(
      `${process.env.PROJECT_URL}/api/contact-types/${id}`
    );

    expect(result.data.id).toEqual(id);
    expect(result.data).toEqual(updatedItem.data);
  });

  it("Delete delete contact type by id", async () => {
    const createdItem = await axios.post(
      `${process.env.PROJECT_URL}/api/contact-types/`,
      {
        name: String(randomUUID() + Date()),
        title: String(randomUUID() + Date()),
        title_ru: String(randomUUID() + Date()),
      }
    );

    const id = createdItem.data.id;

    await axios.delete(`${process.env.PROJECT_URL}/api/contact-types/${id}`);

    await axios
      .get(`${process.env.PROJECT_URL}/api/contact-types/${id}`)
      .then(() => expect(true).toEqual(false))
      .catch((err) => expect(err.response.status).toEqual(404));
  });
});

describe("[FAIL] Contact type (e2e)", () => {
  const idOfCreatedItems: number[] = [];

  afterAll(async () => {
    for (let id of idOfCreatedItems) {
      await axios.delete(`${process.env.PROJECT_URL}/api/contact-types/${id}`);
    }
  });

  it("Get contact type by id that does not exist", async () => {
    try {
      await axios.get(`${process.env.PROJECT_URL}/api/contact-types/999`);
    } catch (err) {
      expect(err.response.status).toEqual(404);
    }
  });

  it("Get contact type by id that is incorrect", async () => {
    try {
      await axios.get(`${process.env.PROJECT_URL}/api/contact-types/NaN`);
    } catch (err) {
      expect(err.response.status).toEqual(400);
    }
  });

  it("Post create contact type with empty name", async () => {
    try {
      await axios.post(`${process.env.PROJECT_URL}/api/contact-types`, {
        name: "",
        title: String(randomUUID() + Date()),
        title_ru: String(randomUUID() + Date()),
      });
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.data).toEqual({
        message: "VALIDATION_FAILED",
        description: [
          {
            property: "name",
            children: [],
            constraints: {
              isNotEmpty: "name should not be empty",
            },
          },
        ],
      });
    }
  });

  it("Post create contact type with empty data", async () => {
    try {
      await axios.post(`${process.env.PROJECT_URL}/api/contact-types`, {
        name: "",
        title: "",
        title_ru: "",
      });
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.data).toEqual({
        message: "VALIDATION_FAILED",
        description: [
          {
            property: "name",
            children: [],
            constraints: {
              isNotEmpty: "name should not be empty",
            },
          },
          {
            property: "title",
            children: [],
            constraints: {
              isNotEmpty: "title should not be empty",
            },
          },
          {
            property: "title_ru",
            children: [],
            constraints: {
              isNotEmpty: "title_ru should not be empty",
            },
          },
        ],
      });
    }
  });

  it("Put update contact type with empty name", async () => {
    try {
      const createdItem = await axios.post(
        `${process.env.PROJECT_URL}/api/contact-types/`,
        {
          name: String(randomUUID() + Date()),
          title: String(randomUUID() + Date()),
          title_ru: String(randomUUID() + Date()),
        }
      );

      const id = createdItem.data.id;
      idOfCreatedItems.push(id);

      await axios.put(`${process.env.PROJECT_URL}/api/contact-types/${id}`, {
        name: "",
        title: String(randomUUID() + Date()),
        title_ru: String(randomUUID() + Date()),
      });
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.data).toEqual({
        message: "VALIDATION_FAILED",
        description: [
          {
            property: "name",
            children: [],
            constraints: {
              isNotEmpty: "name should not be empty",
            },
          },
        ],
      });
    }
  });

  it("Put update contact type with empty data", async () => {
    try {
      const createdItem = await axios.post(
        `${process.env.PROJECT_URL}/api/contact-types/`,
        {
          name: String(randomUUID() + Date()),
          title: String(randomUUID() + Date()),
          title_ru: String(randomUUID() + Date()),
        }
      );

      const id = createdItem.data.id;
      idOfCreatedItems.push(id);

      await axios.put(`${process.env.PROJECT_URL}/api/contact-types/${id}`, {
        name: "",
        title: "",
        title_ru: "",
      });
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.data).toEqual({
        message: "VALIDATION_FAILED",
        description: [
          {
            property: "name",
            children: [],
            constraints: {
              isNotEmpty: "name should not be empty",
            },
          },
          {
            property: "title",
            children: [],
            constraints: {
              isNotEmpty: "title should not be empty",
            },
          },
          {
            property: "title_ru",
            children: [],
            constraints: {
              isNotEmpty: "title_ru should not be empty",
            },
          },
        ],
      });
    }
  });

  it("Put update contact type by id that does not exist", async () => {
    try {
      await axios.put(
        `${process.env.PROJECT_URL}/api/contact-types/99999999999999`,
        {
          name: String(randomUUID() + Date()),
          title: String(randomUUID() + Date()),
          title_ru: String(randomUUID() + Date()),
        }
      );
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.status).toEqual(404);
    }
  });

  it("Put update contact type by id that is incorrect", async () => {
    try {
      await axios.put(`${process.env.PROJECT_URL}/api/contact-types/NaN`, {
        name: "test1",
        title: "test1",
        title_ru: "test1",
      });
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.status).toEqual(400);
    }
  });

  it("Delete delete contact type by id that does not exist", async () => {
    try {
      await axios.delete(
        `${process.env.PROJECT_URL}/api/contact-types/99999999999999999`
      );
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.status).toEqual(404);
    }
  });

  it("Delete delete contact type by id that is incorrect", async () => {
    try {
      await axios.delete(`${process.env.PROJECT_URL}/api/contact-types/NaN`);

      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.status).toEqual(400);
    }
  });
});
