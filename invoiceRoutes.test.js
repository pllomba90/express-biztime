process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("./db");
const app = require("./app");
const router = require("./routes/invoices");

beforeEach(async () => {
    await db.query('DROP TABLE IF EXISTS invoices, companies');
    await db.query(`CREATE TABLE companies (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    )`);
  console.log("Table dropped and created")
    await db.query(`CREATE TABLE invoices (
      id SERIAL PRIMARY KEY,
      comp_code TEXT REFERENCES companies(code) ON DELETE CASCADE,
      amt NUMERIC(10, 2) NOT NULL,
      add_date DATE DEFAULT CURRENT_DATE,
      paid BOOLEAN DEFAULT false,
      paid_date DATE
    )`);
  
    await db.query(`
      INSERT INTO companies(code, name, description)
      VALUES ('apple', 'Apple Computer', 'Maker of OSX.')`);
  
    await db.query(`
      INSERT INTO invoices (comp_code, amt, paid, paid_date)
      VALUES ('apple', 100.00, false, null),
             ('apple', 200.00, false, null)`);
  });
  
  afterEach(async () => {
    await db.query('DROP TABLE IF EXISTS invoices, companies');
  });
  

describe("Testing my invoice routes", () =>{
    test("Should get all invoices", async ()=> {
        const resp = await request(app).get("/invoices");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"invoices": [
            {
              "id": 1,
              "comp_code": "apple"
            },
            {
              "id": 2,
              "comp_code": "apple"
            }]});
    });

    test("Should get a specific invoice", async () =>{
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString();
        const resp = await request(app).get("/invoices/1");
        console.log("Response:", resp.body);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"invoice":{
            "id": 1,
            "company":{
                "code" : "apple",
                "name" : "Apple Computer",
                "description" : "Maker of OSX."
            },
            "amt" : 100.00,
            "add_date" : formattedDate,
            "paid" : false,
            "paid_date": null

        }});
    });

    test("Should add an invoice", async () => {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString();
      const newInfo = {
        comp_code : "apple",
        amt : 200,
        add_date : formattedDate,
        paid : false,
        paid_date : null
      };
      const resp = request(app).post("/invoices").send(newInfo);
      expect(resp.statusCode).toBe(201);
      expect(resp.body).toEqual({"invoice":{
        "id": 3,
        "company":{
            "code" : "apple",
            "name" : "Apple Computer",
            "description" : "Maker of OSX."
        },
        "amt" : 200.00,
        "add_date" : formattedDate,
        "paid" : false,
        "paid_date": null

    }});
    });

    test("Should modify an invoice", async () => {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString();
      const newInfo = {
        amt : 150,
        paid : true
      };
      const resp = (await request(app).put("/invoices/1")).send(newInfo);
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({"invoice":{
        "id": 1,
        "company":{
            "code" : "apple",
            "name" : "Apple Computer",
            "description" : "Maker of OSX."
        },
        "amt" : 150,
        "add_date" : formattedDate,
        "paid" : true,
        "paid_date": formattedDate,

    }});
    });

    test("Should delete an invoice", async () =>{
      const resp = request(app).delete("/invoices/1");
      expect(resp.statusCode).toBe(200);
      expect(resp.body).toEqual({"status": "deleted"});
    });
})