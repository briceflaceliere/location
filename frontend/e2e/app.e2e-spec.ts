import { FindHomePage } from './app.po';

describe('find-home App', () => {
  let page: FindHomePage;

  beforeEach(() => {
    page = new FindHomePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
