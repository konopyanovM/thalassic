import { registerCustomProperty } from './register-custom-property';

describe('registerCustomProperty', () => {
  const definition = (name: string): PropertyDefinition => ({
    name,
    syntax: '<length>',
    inherits: false,
    initialValue: '0px',
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('registers a property only once however often it is asked', () => {
    const registerProperty = vi.fn();
    vi.stubGlobal('CSS', { registerProperty });

    registerCustomProperty(definition('--tls-test-once'));
    registerCustomProperty(definition('--tls-test-once'));

    expect(registerProperty).toHaveBeenCalledTimes(1);
    expect(registerProperty).toHaveBeenCalledWith(definition('--tls-test-once'));
  });

  it('accepts a property the document already has registered', () => {
    vi.stubGlobal('CSS', {
      registerProperty: () => {
        throw new DOMException('already registered', 'InvalidModificationError');
      },
    });

    expect(() => registerCustomProperty(definition('--tls-test-existing'))).not.toThrow();
  });

  it('surfaces any other failure', () => {
    vi.stubGlobal('CSS', {
      registerProperty: () => {
        throw new DOMException('bad syntax', 'SyntaxError');
      },
    });

    expect(() => registerCustomProperty(definition('--tls-test-invalid'))).toThrow();
  });

  it('does nothing where the API is unavailable', () => {
    vi.stubGlobal('CSS', undefined);

    expect(() => registerCustomProperty(definition('--tls-test-unavailable'))).not.toThrow();
  });
});
