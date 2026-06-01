export {
  PIPELINE_AGENT_MINI_MODULES_VERSION,
  PIPELINE_AGENT_REGISTRY_PATH,
  PIPELINE_AGENT_REGISTRY_FRONTEND_MIRROR,
  loadPipelineAgentRegistry,
  listRegistryMiniModules,
  listInfrastructureFrontendMiniModules,
  listBackendPipelineMiniModuleSlugs,
  listFrontendPipelineMiniModuleSlugs,
  listFrontendAiOpsMiniModules,
  getMiniModuleByLogicalAgentId,
  getFrontendSlugForLogicalAgentId,
  getBackendSlugForLogicalAgentId
} from "../../backend/src/shared/contracts/pipelineAgentMiniModules.contract.js";
