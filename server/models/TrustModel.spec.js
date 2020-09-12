const TrustModel = require("./TrustModel");
const mockKnex = require("mock-knex");
const tracker = mockKnex.getTracker();
const knex = require("../database/knex");
const chai = require("chai");
const {expect} = chai;
const jestExpect = require("expect");

describe("TrustModel", () => {
  let trustModel;

  before(() => {
    mockKnex.mock(knex);
    tracker.install();
    trustModel = new TrustModel();
  });

  after(() => {
    mockKnex.unmock(knex);
    tracker.uninstall();
  });

  it("get trust_relationships", async () => {
    tracker.on("query", (query) => {
      expect(query.sql).match(/select.*trust_relationship.*/);
      query.response([{
        a:1,
      }]);
    });
    const trust_relationships = await trustModel.get();
    expect(trust_relationships).lengthOf(1);
  });


  describe("Request trust", () => {

    it("request with a wrong type would throw error", async () => {
      await jestExpect(async () => {
        await trustModel.request("wrongType","test")
      }).rejects.toThrow();
    });

    it("request with a wrong wallet name would throw error", async () => {
      await jestExpect(async () => {
        await trustModel.request("send","tes t");
      }).rejects.toThrow();
    });

    it("request successfully", async () => {
      //TODO ? why must uninstall & install here?
      tracker.uninstall();
      tracker.install();
      tracker.on("query", function sendResult(query, step){
        [
          function firstQuery(){
            expect(query.sql).match(/select.*entity.*/);
            query.response([{
              id: 1,
            }]);
          },
          function secondQuery(){
            expect(query.sql).match(/insert.*entity_trust.*/);
            query.response([]);
          },
        ][step -1]();
      });
      await trustModel.request("send", "test");
    });

    describe("trustModel.accept", () => {
      it("accept a request with id which do not exist", async () => {
        tracker.uninstall();
        tracker.install();
        tracker.on("query", (query) => {
          expect(query.sql).match(/select.*entity_trust.*/);
          query.response([]);
        });
        const trustRelationshipId = 0;
        await jestExpect(async () => {
          await trustModel.accept(trustRelationshipId);
        }).rejects.toThrow();
      });

      it("accept successfully", async () => {
        const trustRelationshipId = 0;
        tracker.uninstall();
        tracker.install();
        tracker.on("query", (query) => {
          expect(query.sql).match(/select.*entity_trust.*/);
          query.response([{
          }]);
        });
        await trustModel.accept(trustRelationshipId);
      });

    });

  });

});

