class Interactor {
  constructor(prompt, entryPoint, menuMap) {
    this.prompt = prompt;
    this.entryPoint = entryPoint;
    this.menuMap = menuMap;
  }

  async start() {
    await this._goto(this.entryPoint);
  }

  async _goto(name, isFirstMenu = true) {
    const menu = this.menuMap[name];
    if (menu == null) {
      throw Error(`Menu named '${name}' not found`);
    }

    if (typeof menu == 'function') {
      await this._invokeCallbackMenu(menu, isFirstMenu);
    } else if (typeof menu == 'object') {
      const nextName = await this._showSingleChoiceMenu(menu, isFirstMenu);
      if (nextName === Interactor.RETURN)
        return;
      
      await this._goto(nextName, false);
      await this._goto(name, isFirstMenu);
    } else {
      throw Error(`Menu named '${name}' is of invalid type`);
    }
  }

  async _invokeCallbackMenu(callbackMenu, isFirstMenu) {
    if (isFirstMenu)
      throw Error(`Entrypoint menu cannot be a callback`);
    else
      await callbackMenu(this.prompt);
  }

  async _showSingleChoiceMenu(menu, isFirstMenu) {
    this._printSingleChoiceMenu(menu);

    const { choices = {} } = menu;
    choices[isFirstMenu ? 'Exit' : 'Back'] = Interactor.RETURN;

    const selected = await this.prompt.selectOneFrom('Select', ...Object.keys(choices));
    const nextName = choices[selected];
    return nextName;
  }

  async _printSingleChoiceMenu(menu) {
    const { title, description } = menu;
    this.prompt.clear();

    if (title)
      this.prompt.print(title);
    if (description)
      this.prompt.print(description);
  }
};

Interactor.RETURN = "__RETURN!__";

module.exports = Interactor;