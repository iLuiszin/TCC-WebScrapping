import { Builder, Browser, By, Key, until } from "selenium-webdriver";

const shopeeScrapper = async (url = 'https://shopee.com.br/Razer-Mouse-%C3%93ptico-Ergon%C3%B4mico-De-DeathAdder-6400DPI-Com-Fio-USB-i.262478502.12540969018') => {

  const driver = await new Builder().forBrowser(Browser.FIREFOX).build();

  await driver.get(url);
}

shopeeScrapper()