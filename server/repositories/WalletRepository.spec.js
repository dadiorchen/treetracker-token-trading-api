const WalletRepository = require("./WalletRepository");
const {expect} = require("chai");
const knex = require("../database/knex");
const mockKnex = require("mock-knex");
const tracker = mockKnex.getTracker();
const jestExpect = require("expect");



describe("WalletRepository", () => {
  let walletRepository;

  beforeEach(() => {
    mockKnex.mock(knex);
    tracker.install();
    walletRepository = new WalletRepository();
  })

  afterEach(() => {
    tracker.uninstall();
    mockKnex.unmock(knex);
  });

  it("getByName", async () => {
    tracker.uninstall();
    tracker.install();
    tracker.on("query", (query) => {
      expect(query.sql).match(/select.*wallet.*/);
      query.response([{id:1}]);
    });
    const entity = await walletRepository.getByName("Dadior");
    expect(entity).to.be.a("object");
  });

  it("getByName can not find the wallet name", async () => {
    tracker.uninstall();
    tracker.install();
    tracker.on("query", (query) => {
      expect(query.sql).match(/select.*wallet.*/);
      query.response([]);
    });
    await jestExpect(async () => {
      await walletRepository.getByName("Dadior");
    }).rejects.toThrow(/can not find entity/);
  });
});
