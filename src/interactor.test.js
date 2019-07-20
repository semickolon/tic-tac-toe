const Interactor = require('./interactor');
const Prompt = require('./prompt');

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, 'log').mockImplementation();
});

test('displays single menu', async () => {
  const prompt = new Prompt();
  const interactor = new Interactor(prompt, 'entry', {
    entry: {
      title: 'Welcome',
      description: 'Hello world',
    }
  });
  setPromptSelectionInOrder(prompt, 'Exit');

  await interactor.start();

  expect(prompt.contents).toContain('Welcome');
  expect(prompt.contents).toContain('Hello world');
  expect(prompt.selectOneFrom).toHaveBeenCalledWith(expect.any(String), 'Exit');
});

test('displays three menus of depth 1', async () => {
  const prompt = new Prompt();
  const interactor = new Interactor(prompt, 'main', {
    main: {
      title: 'Hello, world',
      description: 'Idek',
      choices: {
        'Enter menu 1': 'menu1',
        'Enter menu 2': 'menu2',
      }
    },
    menu1: {
      title: 'Menu 1',
      description: 'This is menu 1 lmao',
    },
    menu2: {
      title: 'Menu 2',
      description: 'This is menu 2 lmao',
    }
  });
  setPromptSelectionInOrder(prompt,
    'Enter menu 1', 'Back', 'Enter menu 2', 'Back', 'Exit');

  await interactor.start();

  expect(prompt.contents).toContain('Hello, world');
  expect(prompt.contents).toContain('Idek');
  expect(prompt.selectOneFrom)
    .toHaveBeenNthCalledWith(1, expect.any(String), 'Enter menu 1', 'Enter menu 2', 'Exit');

  expect(prompt.contents).toContain('Menu 1');
  expect(prompt.contents).toContain('This is menu 1 lmao');
  expect(prompt.selectOneFrom) 
    .toHaveBeenNthCalledWith(2, expect.any(String), 'Back');

  expect(prompt.contents).toContain('Menu 2');
  expect(prompt.contents).toContain('This is menu 2 lmao');
  expect(prompt.selectOneFrom)
    .toHaveBeenNthCalledWith(4, expect.any(String), 'Back');
});

test('invokes callbacks from menu', async () => {
  const prompt = new Prompt();
  const syncFunc = jest.fn(() => 23);
  const asyncFunc = jest.fn(async () => 42);
  const interactor = new Interactor(prompt, 'main', {
    main: {
      choices: {
        'Syncboiz': 'syncFunc',
        'Asyncboiz': 'asyncFunc',
      }
    },
    syncFunc,
    asyncFunc
  });
  setPromptSelectionInOrder(prompt,
    'Syncboiz', 'Asyncboiz', 'Exit');

  await interactor.start();

  expect(syncFunc).toHaveBeenCalledTimes(1);
  expect(syncFunc).toHaveBeenCalledWith(prompt);
  expect(asyncFunc).toHaveBeenCalledTimes(1);
  expect(asyncFunc).toHaveBeenCalledWith(prompt);
});

test('throws when entrypoint menu is not found by name', () => {
  const prompt = new Prompt();
  const interactor = new Interactor(prompt, 'sfsldfkjl', {
    upboiz: {
      title: 'Upboiz not UPboiz par'
    },
    gc_boiz: {
      description: 'kek may underscore'
    }
  });

  expect(interactor.start()).rejects.toThrow(/not found/gi);
});

test('throws when subsequent menu is not found by name', () => {
  const prompt = new Prompt();
  const interactor = new Interactor(prompt, 'entry', {
    entry: {
      choices: {
        'Next': 'next'
      }
    },
    walangNextBro: {
      title: 'Sorry wala eh'
    }
  });
  setPromptSelectionInOrder(prompt, 'Next');

  expect(interactor.start()).rejects.toThrow(/not found/gi);
});

test('throws when entrypoint menu is a callback', () => {
  const prompt = new Prompt();
  const interactor = new Interactor(prompt, 'entry', {
    entry: () => {}
  });

  expect(interactor.start()).rejects.toThrow(/callback/gi);
});

test('throws when menu is not of type function or object', () => {
  const interactor1 = new Interactor(new Prompt(), 'ditokaboi', {
    ditokaboi: 42.023
  });
  const interactor2 = new Interactor(new Prompt(), 'pasokboi', {
    pasokboi: false
  });

  expect(interactor1.start()).rejects.toThrow();
  expect(interactor2.start()).rejects.toThrow();
});

function setPromptSelectionInOrder(prompt, ...choices) {
  const selectOneFrom = jest.spyOn(prompt, 'selectOneFrom');
  return choices.reduce((selectOneFrom, choice) => {
    return selectOneFrom.mockResolvedValueOnce(choice);
  }, selectOneFrom);
}