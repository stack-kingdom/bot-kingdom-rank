import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function scrapeFreeUdemyCourses() {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.goto(
            'https://www.udemy.com/courses/free/?lang=pt&sort=recommended&subcategory=Operating+Systems+%26+Servers&subcategory=Other+IT+%26+Software&subcategory=Programming+Languages&subcategory=Software+Development+Tools',
            {
                waitUntil: 'networkidle2',
                timeout: 60000,
            }
        );

        await page.waitForSelector('[data-purpose="course-title-url"]', {
            timeout: 60000,
        });
        await page.waitForSelector('img[class*="course-card-image_image"]', {
            timeout: 60000,
        });

        const courses = await page.evaluate(() => {
            const courseCards = document.querySelectorAll(
                '[class="course-card-title_title__tvSBS"]'
            );
            return Array.from(courseCards)
                .map((el, index) => {
                    const courseContainer = el.closest(
                        '[class*="course-card_container"]'
                    );
                    const anchor = el.querySelector('a');

                    const title = Array.from(anchor.childNodes)
                        .filter((node) => node.nodeType === Node.TEXT_NODE)
                        .map((node) => node.textContent.trim())
                        .join('');

                    const headlineElement = el.querySelector(
                        '[data-testid="seo-headline"]'
                    );
                    const headline = headlineElement?.textContent.trim() || '';

                    const imageElement = courseContainer?.querySelector(
                        'img[class*="course-card-image_image"]'
                    );
                    let image = '';
                    if (imageElement?.getAttribute('srcset')) {
                        const srcset = imageElement.getAttribute('srcset');
                        const highResMatch = srcset.match(
                            /(https:\/\/img-c\.udemycdn\.com\/course\/480x270\/[^ ]+)/
                        );
                        image = highResMatch
                            ? highResMatch[0]
                            : imageElement.src;
                    } else {
                        image = imageElement?.src || '';
                    }

                    let link = anchor?.href;
                    if (link && link.startsWith('/')) {
                        link = `https://www.udemy.com${link}`;
                    }

                    if (!title || !link) return null;

                    console.log(`Curso ${index + 1}:`, {
                        title,
                        headline,
                        link,
                        image,
                        courseContainerFound: !!courseContainer,
                        imageElementFound: !!imageElement,
                    });

                    return { titulo: title, headline, link, image };
                })
                .filter(Boolean);
        });

        return courses;
    } catch (error) {
        console.error('Erro ao fazer scraping:', error.message);
        return [];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export { scrapeFreeUdemyCourses };
