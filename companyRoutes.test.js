process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("./app");
const db = require("./db");
const router = require("./routes/companies");

beforeEach(()=>{
    db.query(`INSERT INTO companies(code, name, description)
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.')`);
    db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date)
    VALUES ('apple', 100, false, null),
           ('apple', 200, false, null)`);
});

afterEach(()=>{
    db.query(`DELETE FROM companies`);
    db.query(`DELETE FROM invoices`);
});


describe("Testing /companies routes", () =>{
    test("Should get all companies", async() =>{
        const resp = await request(app).get("/companies");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual([{
            "code": "apple",
            "name": "Apple Computer",
            "description": "Maker of OSX."
          }]);
    })

    test("Should get a specific company", async () =>{
        const resp = await request(app).get("/companies/apple");;
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual([{
            "code": "apple",
            "name": "Apple Computer",
            "description": "Maker of OSX."
          }]);
    })

    test("Should add a company", async () => {
        const newCompanyData = {
          code: "IB",
          name: "IBM",
          description: "Big blue."
        };
      
        const resp = await request(app)
          .post("/companies")
          .send(newCompanyData);
      
        expect(resp.status).toBe(201);
        expect(resp.body).toEqual({company:{
            "code": "IB",
            "name": "IBM",
            "description": "Big blue."
          }})
      });
      

    test("Should update a specific company", async () =>{
        const newInfo = {
            name: "Apple",
            description: "Maker of IphoneX."
        }
        const resp = await request(app).put("/companies/apple")
        .send(newInfo);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({company:{
            "code": "apple",
            "name": "Apple",
            "description": "Maker of IphoneX."
          }});
    })

    test("Should delete from the companies table", async () => {
        const resp = await request(app).delete("/companies/apple");
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual({"status": "deleted"});
    })
});