const expect = require('expect-runtime');
const knex = require('../../server/database/knex');
const HttpError = require("./HttpError");
const EntityModel = require("./EntityModel");

class TrustModel{
  async get(){
    //const trust_relationship_instance = new trust_relationship(1);
    const list = await knex.select()
      .table("trust_relationship");
    return list;
  }

  async request(requestType, walletName){
    expect(requestType, () => new HttpError(`The trust request type muse be one of ${Object.keys(TrustModel.ENTITY_TRUST_REQUEST_TYPE).join(',')}`, 400))
      .oneOf(Object.keys(TrustModel.ENTITY_TRUST_REQUEST_TYPE));
    expect(walletName, () => new HttpError("Invalid wallet name", 400))
      .match(/\S+/);
    
    //get entity id
    const entityModel = new EntityModel();
    const entity = await entityModel.getEntityByWalletName((walletName));
    await knex("entity_trust").insert({
      request_type: requestType,
      target_entity_id: entity.id,
    });
  }

  async accept(trustRelationshipId){
    const trustRelationship = await this.getTrustRelationshipById(trustRelationshipId);
  }

  async getTrustRelationshipById(id){
    const result = await knex("entity_trust").where("id", id);
    if(result.length === 0){
      throw new HttpError(`The trust relationship id:${id} do not exist`, 404);
    }else{
      return result[0];
    }
  }
}

TrustModel.ENTITY_TRUST_TYPE = {
  send: 'send',
  manage: 'manage',
  deduct: 'deduct',
}

TrustModel.ENTITY_TRUST_STATE_TYPE = {
  requested: 'requested',
  cancelled_by_originator: 'cancelled_by_orginator',
  canceled_by_actor: 'canceled_by_actor',
  trusted: 'truested',
}

TrustModel.ENTITY_TRUST_REQUEST_TYPE = {
  send: 'send',
  received: 'received',
  manage: 'manage',
  yield: 'yield',
  deduct: 'deduct',
  release: 'release',
}

module.exports = TrustModel;
