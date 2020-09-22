const TrustModel = require("./TrustModel");
const {expect} = require("chai");
const knex = require("../database/knex");
const mockKnex = require("mock-knex");
const tracker = mockKnex.getTracker();


describe("TrustModel", () => {
  let trustModel;

  beforeEach(() => {
    mockKnex.mock(knex);
    tracker.install();
    trustModel = new TrustModel();
  })

  afterEach(() => {
    tracker.uninstall();
    mockKnex.unmock(knex);
  });

  it("get", async () => {
    tracker.on("query", (query) => {
      expect(query.sql).match(/select.*trust.*/);
      query.response([{
        id:1,
      }]);
    });
    const entity = await trustModel.get();
    expect(entity).to.be.a("array");
  });

  it("create", async () => {
    tracker.uninstall();
    tracker.install();
    tracker.on("query", (query) => {
      expect(query.sql).match(/insert.*trust.*/);
      query.response({});
    });
    await trustModel.create({});
  });

  it("getById", async () => {
    tracker.uninstall();
    tracker.install();
    tracker.on("query", (query) => {
      expect(query.sql).match(/select.*trust.*/);
      query.response([{}]);
    });
    await trustModel.getById(1);
  });

  it("update", async () => {
    tracker.uninstall();
    tracker.install();
    tracker.on("query", (query) => {
      expect(query.sql).match(/update.*trust.*/);
      query.response([{}]);
    });
    await trustModel.update({id:1});
  });
});
