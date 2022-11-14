import axios from "axios";

describe("[SUCCESS] Contact type (e2e)", () => {
  it("Get contact types", async () => {
    const result = await axios.get(
      `${process.env.PROJECT_URL}/api/contact-type`
    );
    expect(result.data).toMatchObject([
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
    ]);
  });

  it("Get contact type by id", async () => {
    const result = await axios.get(
      `${process.env.PROJECT_URL}/api/contact-type/7`
    );

    expect(result.data).toMatchObject({
      id: 7,
      name: "dev_to_user",
      title: "Dev.to account name",
      title_ru: "Dev.to account name",
    });
  });

  it("Post create contact type", async () => {
    const result = await axios.post(
      `${process.env.PROJECT_URL}/api/contact-type/`,
      {
        name: "test",
        title: "test",
        title_ru: "test",
      }
    );

    expect(result.data).toMatchObject({
      id: 8,
      name: "test",
      title: "test",
      title_ru: "test",
    });
  });

  it("Patch update contact type by id", async () => {
    const result = await axios.patch(
      `${process.env.PROJECT_URL}/api/contact-type/8`,
      {
        name: "test1",
        title: "test1",
        title_ru: "test1",
      }
    );

    expect(result.data).toMatchObject({
      id: 8,
      name: "test1",
      title: "test1",
      title_ru: "test1",
    });
  });

  it("Delete delete contact type by id", async () => {
    const result = await axios.delete(
      `${process.env.PROJECT_URL}/api/contact-type/8`
    );

    expect(result.data).toMatchObject({
      status: "OK",
    });
  });
});

describe("[FAIL] Contact type (e2e)", () => {
  // it("Get contact type by id that does not exist", async () => {
  //   const result = await axios.get(
  //     `${process.env.PROJECT_URL}/api/contact-type/8`
  //   );

  //   expect(result.data).toMatchObject({
  //     message: "NOT_FOUND",
  //     description: `Contact type with id: 8 not found`,
  //   });
  // });

  // it("Get contact type by id that is incorrect", async () => {
  //   const result = await axios.get(
  //     `${process.env.PROJECT_URL}/api/contact-type/NaN`
  //   );

  //   expect(result.data).toMatchObject({
  //     statusCode: 400,
  //     message: "Validation failed (numeric string is expected)",
  //     error: "Bad Request",
  //   });
  // });

  // /**
  //  * There is no test to Post method
  //  */

  // it("Patch update contact type by id that does not exist", async () => {
  //   const result = await axios.patch(
  //     `${process.env.PROJECT_URL}/api/contact-type/8`,
  //     {
  //       name: "test1",
  //       title: "test1",
  //       title_ru: "test1",
  //     }
  //   );

  //   expect(result.data).toMatchObject({
  //     message: "NOT_FOUND",
  //     description: `Contact type with id: 8 not found`,
  //   });
  // });

  // it("Patch update contact type by id that is incorrect", async () => {
  //   const result = await axios.patch(
  //     `${process.env.PROJECT_URL}/api/contact-type/NaN`,
  //     {
  //       name: "test1",
  //       title: "test1",
  //       title_ru: "test1",
  //     }
  //   );

  //   expect(result.data).toMatchObject({
  //     statusCode: 400,
  //     message: "Validation failed (numeric string is expected)",
  //     error: "Bad Request",
  //   });
  // });

  // it("Delete delete contact type by id that does not exist", async () => {
  //   const result = await axios.delete(
  //     `${process.env.PROJECT_URL}/api/contact-type/8`
  //   );

  //   expect(result.data).toMatchObject({
  //     message: "NOT_FOUND",
  //     description: `Contact type with id: 8 not found`,
  //   });
  // });

  it("Delete delete contact type by id that is incorrect", async () => {
    const result = await axios.delete(
      `${process.env.PROJECT_URL}/api/contact-type/NaN`
    );
    expect(result).toBe(400);
  });
});
