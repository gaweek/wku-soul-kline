const DEEPSEEK_MODELS = ['deepseek-v4-flash', 'deepseek-v4-pro'];

const unique = (items) => [...new Set(items.filter(Boolean))];

export const isDeepSeekEndpoint = (apiBaseUrl = '') => {
  return String(apiBaseUrl).toLowerCase().includes('deepseek');
};

export const getProviderDefaultModel = (apiBaseUrl, requestedModel, fallbackModel) => {
  if (!isDeepSeekEndpoint(apiBaseUrl)) {
    return requestedModel || fallbackModel;
  }

  if (DEEPSEEK_MODELS.includes(requestedModel)) {
    return requestedModel;
  }

  return DEEPSEEK_MODELS[0];
};

export const getProviderFallbackModels = (apiBaseUrl, primaryModel, fallbackModels = []) => {
  const candidates = isDeepSeekEndpoint(apiBaseUrl) ? DEEPSEEK_MODELS : fallbackModels;
  return unique(candidates).filter((model) => model !== primaryModel);
};

export const getProviderModelPool = (apiBaseUrl, primaryModel, fallbackModels = []) => {
  const defaultModel = getProviderDefaultModel(apiBaseUrl, primaryModel, primaryModel);
  return unique([
    defaultModel,
    ...getProviderFallbackModels(apiBaseUrl, defaultModel, fallbackModels),
  ]);
};
