import { ChainApi, GetChainDto } from "./pages/apis/ChainApi";
import { ContractApi } from "./pages/apis/ContractApi";

export enum Color {
  MAIN_BACKGROUND = '#16172B',
  MAIN_BLACK = '#000000',
  MAIN_COBALT = '#00339B',
  MAIN_CYAN = '#00CCFF',
  MAIN_EMBER = '#FF2899',
};

export enum RouteName {
  CONTRACTS = 'contract',
  CONTRACT_META_DATA = 'contracts',
  DEPLOYED_CONTRACTS = 'deployed',
  REGISTER_CONTRACT = 'register',
  CONTRACT_DETAIL = ':contractId',
  DEPLOYED_DETAIL = ':deployedId',

  CHAINS = 'chain',
  CHAIN_META_DATA = 'chains',
  CHAIN_DETAIL = ':chainSeq',
  REGISTER_CHAIN = 'register',

  NODES = 'node',
  NODE_DETAIL = ':nodeId',
  NODE_REGISTER = 'register',

  DEPLOY_CONTRACT = 'deploy',
  DEPLOY_BY_FRONTEND = 'feDeploy',
};

export let CHAINS : GetChainDto[];
await ChainApi.getChainList().then(ret => CHAINS = ret.data)

export let CONTRACT_TYPES : string[];
await ContractApi.getContractTypes().then(ret=>CONTRACT_TYPES = ret.data)
