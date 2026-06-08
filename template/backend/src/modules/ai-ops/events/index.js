export function registerModuleEvents(context) {
  context.eventBus.emit("module:registered", { module: "ai-ops" });
}
