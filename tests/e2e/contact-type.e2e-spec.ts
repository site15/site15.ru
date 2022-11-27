import axios from "axios";

/* Values from init migration */
const contactTypes = [
  {
    id: 1,
    name: "email",
    title: "Email",
    title_ru: "Emial",
  },
  {
    id: 2,
    name: "github_user",
    title: "Github account name",
    title_ru: "Github account name",
  },
  {
    id: 3,
    name: "github_org",
    title: "Github organization name",
    title_ru: "Github organization name",
  },
  {
    id: 4,
    name: "npm_user",
    title: "Npm account name",
    title_ru: "Npm account name",
  },
  {
    id: 5,
    name: "npm_org",
    title: "Npm organization name",
    title_ru: "Npm organization name",
  },
  {
    id: 6,
    name: "twitter_user",
    title: "Twitter account name",
    title_ru: "Twitter account name",
  },
  {
    id: 7,
    name: "dev_to_user",
    title: "Dev.to account name",
    title_ru: "Dev.to account name",
  },
];

describe("[SUCCESS] Contact type (e2e)", () => {
  it("Get contact types", async () => {
    const result = await axios.get(
      `${process.env.PROJECT_URL}/api/contact-type`
    );
    expect(result.data).toEqual(contactTypes);
  });

  it("Get contact type by id", async () => {
    const result = await axios.get(
      `${process.env.PROJECT_URL}/api/contact-type/7`
    );

    expect(result.data).toEqual({
      id: expect.any(Number),
      name: "dev_to_user",
      title: "Dev.to account name",
      title_ru: "Dev.to account name",
    });
  });

  let id;

  it("Post create contact type", async () => {
    const result = await axios.post(
      `${process.env.PROJECT_URL}/api/contact-type/`,
      {
        name: "test",
        title: "test",
        title_ru: "test",
      }
    );

    id = result.data.id;

    expect(result.data).toEqual({
      id: expect.any(Number),
      name: "test",
      title: "test",
      title_ru: "test",
    });
  });

  it("Put update contact type by id", async () => {
    const result = await axios.put(
      `${process.env.PROJECT_URL}/api/contact-type/${id}`,
      {
        name: "test1",
        title: "test1",
        title_ru: "test1",
      }
    );

    expect(result.data).toEqual({
      id: expect.any(Number),
      name: "test1",
      title: "test1",
      title_ru: "test1",
    });
  });

  it("Delete delete contact type by id", async () => {
    const result = await axios.delete(
      `${process.env.PROJECT_URL}/api/contact-type/${id}`
    );

    expect(result.data).toEqual({
      status: "OK",
    });
  });
});

describe("[FAIL] Contact type (e2e)", () => {
  it("Get contact type by id that does not exist", async () => {
    try {
      await axios.get(`${process.env.PROJECT_URL}/api/contact-type/999`);
    } catch (err) {
      expect(err.response.status).toEqual(404);
    }
  });

  it("Get contact type by id that is incorrect", async () => {
    try {
      await axios.get(`${process.env.PROJECT_URL}/api/contact-type/NaN`);
    } catch (err) {
      expect(err.response.status).toEqual(400);
    }
  });

  it("Post create contact type with incorrect data", async () => {
    try {
      await axios.post(`${process.env.PROJECT_URL}/api/contact-type`, {
        name: "",
        title: "",
        title_ru: "",
      });
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.status).toEqual(400);
    }
  });

  it("Put update contact type with incorrect data", async () => {
    try {
      await axios.put(`${process.env.PROJECT_URL}/api/contact-type/7`, {
        name: "",
        title: "",
        title_ru: "",
      });
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.status).toEqual(400);
    }
  });

  it("Put update contact type by id that does not exist", async () => {
    try {
      await axios.put(`${process.env.PROJECT_URL}/api/contact-type/999`, {
        name: "test1",
        title: "test1",
        title_ru: "test1",
      });
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.status).toEqual(404);
    }
  });

  it("Put update contact type by id that is incorrect", async () => {
    try {
      await axios.put(`${process.env.PROJECT_URL}/api/contact-type/NaN`, {
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
      await axios.delete(`${process.env.PROJECT_URL}/api/contact-type/999`);
      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.status).toEqual(404);
    }
  });

  it("Delete delete contact type by id that is incorrect", async () => {
    try {
      const result = await axios.delete(
        `${process.env.PROJECT_URL}/api/contact-type/NaN`
      );

      expect(true).toEqual(false);
    } catch (err) {
      expect(err.response.status).toEqual(400);
    }
  });
});
