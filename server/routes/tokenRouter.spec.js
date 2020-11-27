const request = require("supertest");
const express = require("express");
const tokenRouter = require("./tokenRouter");
const {expect} = require("chai");
const {errorHandler} = require("./utils");
const sinon = require("sinon");
const ApiKeyService = require("../services/ApiKeyService");
const bodyParser = require('body-parser');
const WalletService = require("../services/WalletService");
const JWTService = require("../services/JWTService");
const HttpError = require("../utils/HttpError");
const Token = require("../models/Token");
const TokenService = require("../services/TokenService");
const Wallet = require("../models/Wallet");
const Transfer = require("../models/Transfer");
const TransferService = require("../services/TransferService");

describe("tokenRouter", () => {
  let app;
  const walletLogin = {
    id: 1,
  }

  beforeEach(() => {
    sinon.stub(ApiKeyService.prototype, "check");
    sinon.stub(JWTService.prototype, "verify").returns({
      id: walletLogin.id,
    });
    app = express();
    app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
    app.use(bodyParser.json()); // parse application/json
    app.use(tokenRouter);
    app.use(errorHandler);
  })

  afterEach(() => {
    sinon.restore();
  })

  describe("get tokens, GET /", () => {

    it("limit parameters missed", async () => {
      const res = await request(app)
        .get("/");
      expect(res).property("statusCode").eq(422);
    });

    it("successfully, default wallet", async () => {
      const token = new Token({
        id: 1,
        token: "test-uuid",
        entity_id: 1,
        tree_id: 1,
      });
      const wallet = new Wallet(1);
      sinon.stub(TokenService.prototype, "getByOwner").resolves([token]);
      sinon.stub(WalletService.prototype, "getById").resolves(wallet);
      const res = await request(app)
        .get("/?limit=10");
      expect(res).property("statusCode").eq(200);
      expect(res.body.tokens[0]).property("token").eq("test-uuid");
      expect(res.body.tokens[0]).property("links").property("capture").eq("/capture/1");
      expect(res.body.tokens[0]).property("links").property("tree").eq("/capture/1/tree");
    });

    it("successfully, sub wallet", async () => {
      const token = new Token({
        id: 1,
        token: "test-uuid",
        entity_id: 1,
        tree_id: 1,
      });
      const wallet = new Wallet(1);
      const wallet2 = new Wallet(2);
      sinon.stub(TokenService.prototype, "getByOwner").resolves([token]);
      sinon.stub(WalletService.prototype, "getById").resolves(wallet);
      sinon.stub(WalletService.prototype, "getByName").resolves(wallet2);
      sinon.stub(Wallet.prototype, "hasControlOver").resolves(true);
      const res = await request(app)
        .get("/?limit=10&wallet=B");
      expect(res).property("statusCode").eq(200);
      expect(res.body.tokens[0]).property("token").eq("test-uuid");
      expect(res.body.tokens[0]).property("links").property("capture").eq("/capture/1");
      expect(res.body.tokens[0]).property("links").property("tree").eq("/capture/1/tree");
    });

    it("sub wallet, no permission", async () => {
      const token = new Token({
        id: 1,
        token: "test-uuid",
        entity_id: 1,
        tree_id: 1,
      });
      const wallet = new Wallet(1);
      const wallet2 = new Wallet(2);
      sinon.stub(TokenService.prototype, "getByOwner").resolves([token]);
      sinon.stub(WalletService.prototype, "getById").resolves(wallet);
      sinon.stub(WalletService.prototype, "getByName").resolves(wallet2);
      sinon.stub(Wallet.prototype, "hasControlOver").resolves(false);
      const res = await request(app)
        .get("/?limit=10&wallet=B");
      expect(res).property("statusCode").eq(403);
    });
  });

  it("/test-uuid successfully", async () => {
    const token = new Token({
      id: 1,
      token: "test-uuid",
      entity_id: 1,
      tree_id: 1,
    });
    const wallet = new Wallet(1);
    sinon.stub(TokenService.prototype, "getByUUID").resolves(token);
    sinon.stub(WalletService.prototype, "getById").resolves(wallet);
    sinon.stub(Wallet.prototype, "getSubWallets").resolves([]);
    sinon.stub(TokenService.prototype, "convertToResponse").resolves({
      token: "xxx",
      sender_wallet: "test",
      receiver_wallet: "test",
    });
    const res = await request(app)
      .get("/test-uuid");
    expect(res).property("statusCode").eq(200);
    expect(res.body).property("token").eq("test-uuid");
    expect(res.body).property("links").property("capture").eq("/capture/1");
    expect(res.body).property("links").property("tree").eq("/capture/1/tree");
  });

  it("/xxx/transactions successfully", async () => {
    const token = new Token(1);
    const wallet = new Wallet(1);
    sinon.stub(TokenService.prototype, "getByUUID").resolves(token);
    sinon.stub(token, "toJSON").resolves({
      entity_id: 1,
    });
    sinon.stub(token, "getTransactions").resolves([{
      id: 1,
    }]);
    sinon.stub(WalletService.prototype, "getById").resolves(wallet);
    sinon.stub(TokenService.prototype, "convertToResponse").resolves({
      token: "xxx",
      sender_wallet: "test",
      receiver_wallet: "test",
    });
    sinon.stub(Wallet.prototype, "getSubWallets").resolves([]);
    const res = await request(app)
      .get("/xxxx/transactions");
    expect(res).property("statusCode").eq(200);
    expect(res.body.history).lengthOf(1);
    expect(res.body.history[0]).property("token").eq("xxx");
    expect(res.body.history[0]).property("sender_wallet").eq("test");
    expect(res.body.history[0]).property("receiver_wallet").eq("test");
  });

});
