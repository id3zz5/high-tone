
// ハンバーガーメニュー
document.querySelectorAll('.hamburger-menu').forEach(function (menu) {
    menu.addEventListener('click', function () {
        this.classList.toggle('active');
        // 同じコンテナ内のnav-menuを取得
        const navMenu = this.parentElement.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.classList.toggle('active');
        }
    });
});

// メニュー内リンクをクリックしたら閉じる
document.querySelectorAll('.nav-menu a').forEach(function (link) {
    link.addEventListener('click', function () {
        const spMenu = this.closest('.sp-menu');
        if (!spMenu) return;

        spMenu.querySelector('.hamburger-menu')?.classList.remove('active');
        spMenu.querySelector('.nav-menu')?.classList.remove('active');
    });
});


// スライダー
function initCaseSlider() {
    if ($(window).width() < 1024) {
        if (!$('.case__list').hasClass('slick-initialized')) {
            $('.case__list').slick({
                centerMode: true,
                centerPadding: '60px',
                slidesToShow: 3,
                arrows: true,
                prevArrow: '<button class="slick-prev"><i class="fa-solid fa-angle-left"></i></button>',
                nextArrow: '<button class="slick-next"><i class="fa-solid fa-angle-right"></i></button>',
                appendArrows: $('.case__arrow-area'),
                responsive: [
                    {
                        breakpoint: 768,
                        settings: {
                            arrows: true,
                            centerMode: true,
                            centerPadding: '40px',
                            slidesToShow: 3
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            arrows: true,
                            appendArrows: $('.case__arrow-area'),
                            centerMode: true,
                            centerPadding: '40px',
                            slidesToShow: 1
                        }
                    }
                ]
            });
        }
    } else {
        // 1024px以上なら slick を停止
        if ($('.case__list').hasClass('slick-initialized')) {
            $('.case__list').slick('unslick');
        }
    }
}
// 初回実行
initCaseSlider();

// リサイズ時にも実行
$(window).on('resize', function () {
    initCaseSlider();
});

$('.voice__list').slick({
    centerMode: true,
    centerPadding: '60px',
    slidesToShow: 3,
    variableWidth: true,
    arrows: true,
    prevArrow: '<button class="slick-prev"><i class="fa-solid fa-angle-left"></i></button>',
    nextArrow: '<button class="slick-next"><i class="fa-solid fa-angle-right"></i></button>',
    appendArrows: $('.voice__arrow-area'),
    responsive: [
        {
            breakpoint: 768,
            settings: {
                arrows: true,
                centerMode: true,
                centerPadding: '40px',
                slidesToShow: 3
            }
        },
        {
            breakpoint: 480,
            settings: {
                arrows: true,
                appendArrows: $('.voice__arrow-area'),
                centerMode: true,
                centerPadding: '40px',
                slidesToShow: 1
            }
        }
    ]
});

function initGoodsSlider() {
    if ($(window).width() < 1024) {
        if (!$('.goods__list').hasClass('slick-initialized')) {
            $('.goods__list').slick({
                centerMode: true,
                centerPadding: '60px',
                slidesToShow: 3,
                arrows: true,
                prevArrow: '<button class="slick-prev"><i class="fa-solid fa-angle-left"></i></button>',
                nextArrow: '<button class="slick-next"><i class="fa-solid fa-angle-right"></i></button>',
                appendArrows: $('.goods__arrow-area'),
                responsive: [
                    {
                        breakpoint: 768,
                        settings: {
                            arrows: false,
                            centerMode: true,
                            centerPadding: '40px',
                            slidesToShow: 3
                        }
                    },
                    {
                        breakpoint: 480,
                        settings: {
                            arrows: true,
                            appendArrows: $('.goods__arrow-area'),
                            centerMode: true,
                            centerPadding: '40px',
                            slidesToShow: 1
                        }
                    }
                ]
            });
        }
    } else {
        // 1024px以上なら slick を停止
        if ($('.goods__list').hasClass('slick-initialized')) {
            $('.goods__list').slick('unslick');
        }
    }
}
// 初回実行
initGoodsSlider();

// リサイズ時にも実行
$(window).on('resize', function () {
    initGoodsSlider();
});






// microcms

// データを取得
async function getMicroCMSData(endpoint, options = {}) {
    try {
        // URLSearchParamsを使ってクエリを組み立てる
        const params = new URLSearchParams({
            endpoint: endpoint,
            ...options
        });

        const response = await fetch(`api-proxy.php?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

//index.html
getMicroCMSData('info')
    .then(res => {
        document.querySelector('#open').textContent = (res.open);
        document.querySelector('#lastorder').textContent = (res.lastorder);
        document.querySelector('#close').textContent = (res.close);
        document.querySelector('#pay').textContent = (res.pay);
    });

getMicroCMSData('menucategory')
    .then(categoryRes => {

        const categories = categoryRes.contents;

        return getMicroCMSData('menu', { depth: 2 })
            .then(menuRes => ({ categories, menus: menuRes.contents }));
    })
    .then(({ categories, menus }) => {

        // カテゴリID → category を引けるようにする
        const categoryMap = {};
        categories.forEach(category => {
            categoryMap[category.id] = category;
        });

        const grouped = {};
        menus.forEach(menu => {
            const categoryId = menu.category?.id;
            if (!categoryId) return;

            if (!grouped[categoryId]) {
                grouped[categoryId] = [];
            }
            grouped[categoryId].push(menu);
        });

        const list = document.getElementById('top-menu-list');
        if (!list) return;
        list.innerHTML = '';

        categories
            .sort((a, b) => a.order - b.order)
            .forEach(category => {

                const menuList = grouped[category.id];
                if (!menuList) return;

                menuList.sort((a, b) => a.order - b.order);
                const menu = menuList[0];

                const link = document.createElement('a');
                link.className = 'menu__link';
                link.href = `./menu.html#menu-${category.id}`;

                if (menu.image?.url) {
                    link.style.backgroundImage =
                        `url(${menu.image.url}?w=800&h=600&fit=crop)`;
                }

                link.innerHTML = `
      <dl class="menu__item">
        <dt class="menu__subtitle">${category.subtitle}</dt>
        <dd class="menu__price">
          <span class="menu__price-name">${menu.name}</span>
          <span class="menu__price-cost">${menu.price}</span>
        </dd>
      </dl>
    `;

                list.appendChild(link);
            });
    });

//menu.html
getMicroCMSData('menucategory')
    .then((categoryRes) => {
        const categories = categoryRes.contents;
        categories.sort((a, b) => a.order - b.order);

        return getMicroCMSData('menu', { depth: 2 })
            .then(menuRes => ({ categories, menus: menuRes.contents }));
    })
    .then(({ categories, menus }) => {

        menus.sort((a, b) => a.order - b.order);

        const list = document.getElementById('menu-list');
        if (!list) return;
        list.innerHTML = '';

        categories.forEach(category => {

            const article = document.createElement('article');
            article.className = 'single-menu__item container';
            article.id = `menu-${category.id}`;

            const pic = document.createElement('div');
            pic.className = 'container__pic';
            pic.innerHTML = `
                <img src="${category.image?.url || '../images/pic_flow03.webp'}" alt="">
            `;

            const text = document.createElement('div');
            text.className = 'container__text';

            const subtitle = document.createElement('h3');
            subtitle.className = 'container__subtitle';
            subtitle.textContent = category.subtitle;
            text.appendChild(subtitle);

            menus
                .filter(menu => menu.category?.id === category.id)
                .forEach(menu => {
                    const dl = document.createElement('dl');
                    dl.className = 'container__price';
                    dl.innerHTML = `
                        <dt class="container__name">${menu.name}</dt>
                        <dd class="container__cost">${menu.price}</dd>
                    `;
                    text.appendChild(dl);
                });

            article.appendChild(pic);
            article.appendChild(text);
            list.appendChild(article);
        });
        const hash = location.hash;
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

//headerの文字の色を変える
const gnavList = document.querySelector('.gnav-header__list');
const mainvisual = document.querySelector('.mainvisual');

window.addEventListener('scroll', () => {
    if (mainvisual) {
        const mvBottom = mainvisual.offsetTop + mainvisual.offsetHeight;

        if (window.scrollY < mvBottom) {
            gnavList.classList.add('is-white');
        } else {
            gnavList.classList.remove('is-white');
        }
    }
});

// フェードイン
document.addEventListener('DOMContentLoaded', function () {
    const targets = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-show');
            }
        });
    });

    targets.forEach(function (target) {
        observer.observe(target);
    });
});


//いるところに線が出る
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.gnav-header__item');

    function onScroll() {
        let currentSectionId = '';

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;

            // 画面中央に来た section を判定
            if (sectionTop <= window.innerHeight / 2 &&
                sectionTop + sectionHeight > window.innerHeight / 2) {
                currentSectionId = section.id;
            }
        });

        navItems.forEach(item => {
            item.classList.remove('is-active');

            const link = item.querySelector('a');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('is-active');
            }
        });
    }

    window.addEventListener('scroll', onScroll);
    onScroll(); // 初期表示時
});
