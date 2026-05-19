/* ============================================
   ZORA SMILE — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Announcement bar (closeable) ---- */
  const annBar = document.querySelector('.announcement-bar');
  const annClose = document.querySelector('.announcement-bar .close-bar');
  if (annBar && annClose) {
    if (sessionStorage.getItem('zora-ann-closed') === '1') {
      annBar.classList.add('hidden');
    }
    annClose.addEventListener('click', () => {
      annBar.classList.add('hidden');
      sessionStorage.setItem('zora-ann-closed', '1');
    });
  }

  /* ---- Navbar scroll effect ---- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile menu toggle ---- */
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ---- Mobile CTA bar element (shared) ---- */
  const mobileCta = document.querySelector('.mobile-cta-bar');

  /* ---- Cart state ---- */
  const FREE_SHIP_THRESHOLD = 50;
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('zora-cart-v2') || '[]');
    if (!Array.isArray(cart)) cart = [];
  } catch (e) { cart = []; }

  function saveCart() { localStorage.setItem('zora-cart-v2', JSON.stringify(cart)); }
  function getCartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
  function getCartCount() { return cart.reduce((s, i) => s + i.qty, 0); }

  /* ---- Inject cart drawer once ---- */
  function injectCartDrawer() {
    if (document.querySelector('.cart-drawer')) return;
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    const drawer = document.createElement('aside');
    drawer.className = 'cart-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `
      <div class="cart-header">
        <h3>Your Cart (<span class="cart-item-count">0</span>)</h3>
        <button class="cart-close" aria-label="Close cart">&times;</button>
      </div>
      <div class="cart-shipping">
        <p class="cart-shipping-text">Add <strong class="cart-shipping-remaining">$50.00</strong> more for <strong>FREE SHIPPING</strong></p>
        <div class="cart-shipping-bar"><div class="cart-shipping-fill"></div></div>
      </div>
      <div class="cart-discount-banner">
        <span class="check-box">&#10003;</span> Limited Time Discount Auto-Applied
      </div>
      <div class="cart-items"></div>
      <div class="cart-footer">
        <div class="cart-subtotal">
          <span>Subtotal</span>
          <strong class="cart-subtotal-val">$0.00</strong>
        </div>
        <button class="btn btn-primary cart-checkout" type="button">
          <span>&#x1F512;</span> Secure Checkout
        </button>
        <div class="cart-trust">
          <div class="cart-trust-item">
            <span class="ico">&#9733;</span>
            <span class="lbl">4.8 Stars<br>12K+ reviews</span>
          </div>
          <div class="cart-trust-item">
            <span class="ico">&#x21BB;</span>
            <span class="lbl">30-day<br>guarantee</span>
          </div>
          <div class="cart-trust-item">
            <span class="ico">&#x1F512;</span>
            <span class="lbl">Secure<br>checkout</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
  }
  injectCartDrawer();

  /* ---- Render cart ---- */
  function renderCart() {
    const itemsEl = document.querySelector('.cart-items');
    if (!itemsEl) return;

    if (cart.length === 0) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <div class="glyph">&#x1F6D2;</div>
          <h4>Your cart is empty</h4>
          <p>Find your bright new routine.</p>
          <a href="shop.html" class="btn btn-primary">Shop now &#8594;</a>
        </div>
      `;
    } else {
      itemsEl.innerHTML = cart.map((item, idx) => {
        const lineTotal = (item.price * item.qty).toFixed(2);
        const oldLine = item.oldPrice ? `<span class="old">$${(item.oldPrice * item.qty).toFixed(2)}</span>` : '';
        return `
          <div class="cart-item">
            <div class="cart-item-thumb"><span class="glyph">${item.glyph || '✨'}</span></div>
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              <div class="cart-item-bottom">
                <div class="cart-item-qty">
                  <button type="button" data-cart-decr="${idx}" aria-label="Decrease">&minus;</button>
                  <span class="num">${item.qty}</span>
                  <button type="button" data-cart-incr="${idx}" aria-label="Increase">+</button>
                </div>
                <span class="cart-item-price">${oldLine}$${lineTotal}</span>
              </div>
            </div>
            <button class="cart-item-remove" type="button" data-cart-remove="${idx}">Remove</button>
          </div>
        `;
      }).join('');
    }

    // Header count
    document.querySelectorAll('.cart-item-count').forEach(el => el.textContent = getCartCount());
    // Nav badge
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = getCartCount());

    // Subtotal (with old price line if any items have oldPrice)
    const total = getCartTotal();
    const oldTotal = cart.reduce((s, i) => s + (i.oldPrice || i.price) * i.qty, 0);
    const subEl = document.querySelector('.cart-subtotal-val');
    if (subEl) {
      const oldStr = oldTotal > total ? `<span class="old">$${oldTotal.toFixed(2)}</span>` : '';
      subEl.innerHTML = `${oldStr}$${total.toFixed(2)}`;
    }

    // Shipping progress
    const remaining = Math.max(0, FREE_SHIP_THRESHOLD - total);
    const fillPct = Math.min(100, (total / FREE_SHIP_THRESHOLD) * 100);
    const fillEl = document.querySelector('.cart-shipping-fill');
    if (fillEl) fillEl.style.width = fillPct + '%';
    const txtEl = document.querySelector('.cart-shipping-text');
    if (txtEl) {
      if (remaining === 0 && total > 0) {
        txtEl.innerHTML = `<strong>&#x1F389; You unlocked FREE SHIPPING!</strong>`;
      } else {
        txtEl.innerHTML = `Add <strong class="cart-shipping-remaining">$${remaining.toFixed(2)}</strong> more for <strong>FREE SHIPPING</strong>`;
      }
    }

    saveCart();
    updateMobileCta();
  }

  /* ---- Open/close drawer ---- */
  function openCart() {
    const ov = document.querySelector('.cart-overlay');
    const dr = document.querySelector('.cart-drawer');
    if (ov) ov.classList.add('open');
    if (dr) { dr.classList.add('open'); dr.setAttribute('aria-hidden', 'false'); }
    document.body.style.overflow = 'hidden';
    renderCart();
  }
  function closeCart() {
    const ov = document.querySelector('.cart-overlay');
    const dr = document.querySelector('.cart-drawer');
    if (ov) ov.classList.remove('open');
    if (dr) { dr.classList.remove('open'); dr.setAttribute('aria-hidden', 'true'); }
    document.body.style.overflow = '';
  }

  /* ---- Add to cart ---- */
  function addToCart({ name, price, oldPrice, glyph }) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({
        name,
        price: parseFloat(price) || 0,
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        glyph: glyph || '✨',
        qty: 1
      });
    }
    renderCart();
    openCart();
  }

  /* ---- Wire up add-to-cart buttons ---- */
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = btn.getAttribute('data-product-name') || 'Product';
      let price = parseFloat(btn.getAttribute('data-product-price'));
      const oldPrice = btn.getAttribute('data-product-old');
      let glyph = btn.getAttribute('data-product-glyph');

      // PDP: read live CTA price if present
      if (isNaN(price)) {
        const ctaPriceEl = btn.querySelector('[data-cta-price]');
        if (ctaPriceEl) {
          const txt = ctaPriceEl.textContent.replace(/[^0-9.]/g, '');
          price = parseFloat(txt);
        }
      }
      // PDP: try to grab the gallery's first slide glyph as thumb
      if (!glyph) {
        const heroGlyph = document.querySelector('.gallery-slide.active .glyph')
          || document.querySelector('.hero-card .glyph');
        if (heroGlyph) glyph = heroGlyph.textContent.trim();
      }

      addToCart({ name, price: price || 0, oldPrice, glyph });
    });
  });

  /* ---- Cart drawer event delegation ---- */
  document.addEventListener('click', (e) => {
    if (e.target.closest('.cart-close') || e.target.classList.contains('cart-overlay')) {
      closeCart();
    }
    if (e.target.closest('.cart-checkout')) {
      if (getCartCount() > 0) window.location.href = '/checkout';
    }
    const incrEl = e.target.closest('[data-cart-incr]');
    const decrEl = e.target.closest('[data-cart-decr]');
    const removeEl = e.target.closest('[data-cart-remove]');
    if (incrEl) {
      const idx = parseInt(incrEl.getAttribute('data-cart-incr'));
      if (cart[idx]) cart[idx].qty++;
      renderCart();
    }
    if (decrEl) {
      const idx = parseInt(decrEl.getAttribute('data-cart-decr'));
      if (cart[idx]) {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      }
      renderCart();
    }
    if (removeEl) {
      const idx = parseInt(removeEl.getAttribute('data-cart-remove'));
      cart.splice(idx, 1);
      renderCart();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  /* ---- Navbar cart button opens drawer ---- */
  document.querySelectorAll('.nav-shop-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCart();
    });
  });

  /* ---- Cart drawer "Secure Checkout" button goes to checkout page ---- */
  document.addEventListener('click', (e) => {
    const ckBtn = e.target.closest('.cart-checkout');
    if (ckBtn) {
      if (cart.length === 0) return;
      window.location.href = '/checkout';
    }
  });
  /* ---- Mobile sticky bar opens drawer when cart has items ---- */
  if (mobileCta) {
    mobileCta.addEventListener('click', (e) => {
      if (getCartCount() > 0) {
        e.preventDefault();
        openCart();
      }
    });
  }

  // Initial render
  renderCart();

  /* ---- Mobile sticky CTA bar ---- */
  function updateMobileCta() {
    if (!mobileCta) return;
    const btn = mobileCta.querySelector('.mobile-cta-btn');
    const infoTitle = mobileCta.querySelector('.cta-info strong');
    const infoSub = mobileCta.querySelector('.cta-info span');
    const count = (typeof getCartCount === 'function') ? getCartCount() : 0;
    if (count > 0) {
      if (btn) {
        btn.textContent = `View Cart →`;
      }
      if (infoTitle) infoTitle.textContent = `${count} item${count > 1 ? 's' : ''} in cart`;
      if (infoSub) infoSub.textContent = 'Tap to checkout';
    } else {
      if (btn) {
        btn.textContent = `Shop now →`;
        btn.setAttribute('href', 'shop.html');
      }
      if (infoTitle) infoTitle.textContent = 'Free shipping over $50';
      if (infoSub) infoSub.textContent = '30-day money-back guarantee';
    }
  }

  function checkMobileCta() {
    if (!mobileCta) return;
    const isMobile = window.innerWidth < 768;
    const scrolled = window.scrollY > 320;
    if (isMobile && scrolled) {
      mobileCta.classList.add('visible');
      document.body.classList.add('has-mobile-cta');
    } else {
      mobileCta.classList.remove('visible');
      document.body.classList.remove('has-mobile-cta');
    }
  }
  if (mobileCta) {
    checkMobileCta();
    window.addEventListener('scroll', checkMobileCta, { passive: true });
    window.addEventListener('resize', checkMobileCta, { passive: true });
  }

  /* ---- Contact form ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.style.display = 'none';
      const success = document.querySelector('.form-success');
      if (success) success.classList.add('show');
    });
  }

  /* ---- Email signup form ---- */
  document.querySelectorAll('.signup-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const btn = form.querySelector('button');
      if (!input || !input.value.trim()) return;
      btn.textContent = 'Thanks!';
      btn.disabled = true;
      input.value = '';
      setTimeout(() => {
        btn.textContent = 'Get 20% Off';
        btn.disabled = false;
      }, 2400);
    });
  });

  /* ---- Scroll reveal ---- */
  const revealElements = document.querySelectorAll('.section, .reveal');
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
      observer.observe(el);
    });
  }

  /* ---- Active nav link ---- */
  function normalizePath(p) {
    if (!p || p === '#') return null;
    let s = p.replace(/^\/+/, '').replace(/\.html$/i, '').replace(/\/$/, '');
    if (s === '' || s === 'index') return '/';
    return '/' + s;
  }
  const currentNorm = normalizePath(window.location.pathname);
  document.querySelectorAll('.nav-links a:not(.nav-shop-btn)').forEach(link => {
    if (normalizePath(link.getAttribute('href')) === currentNorm) {
      link.classList.add('active');
    }
  });

  /* ---- FAQ Accordion ---- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-question');
    const a = item.querySelector('.faq-answer');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close siblings in same list
      const list = item.closest('.faq-list');
      if (list) {
        list.querySelectorAll('.faq-item.open').forEach(other => {
          if (other !== item) {
            other.classList.remove('open');
            const oa = other.querySelector('.faq-answer');
            if (oa) oa.style.maxHeight = '0';
          }
        });
      }
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = '0';
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---- Marquee duplicate (so loop seamlessly) ---- */
  document.querySelectorAll('.marquee-track').forEach(track => {
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.parentNode.appendChild(clone);
  });

  /* ---- Carousel ---- */
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const prev = carousel.querySelector('.carousel-btn.prev');
    const next = carousel.querySelector('.carousel-btn.next');
    const dotsWrap = carousel.querySelector('.carousel-dots');
    if (!track) return;

    const slides = Array.from(track.children);
    let dots = [];
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => {
          slides[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    const updateDots = () => {
      if (!dots.length) return;
      const trackRect = track.getBoundingClientRect();
      let activeIdx = 0;
      let minDist = Infinity;
      slides.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const dist = Math.abs(r.left - trackRect.left);
        if (dist < minDist) { minDist = dist; activeIdx = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
    };
    updateDots();
    track.addEventListener('scroll', updateDots, { passive: true });

    const slideStep = () => {
      const first = slides[0];
      if (!first) return 0;
      const s2 = slides[1];
      const gap = s2 ? (s2.getBoundingClientRect().left - first.getBoundingClientRect().right) : 0;
      return first.getBoundingClientRect().width + gap;
    };
    if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -slideStep(), behavior: 'smooth' }));
    if (next) next.addEventListener('click', () => track.scrollBy({ left: slideStep(), behavior: 'smooth' }));
  });

  /* ---- Review tabs ---- */
  document.querySelectorAll('.review-tabs').forEach(group => {
    const tabs = group.querySelectorAll('.review-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  });

  /* ---- PDP Gallery ---- */
  const galleryMain = document.querySelector('.gallery-main');
  const galleryThumbs = document.querySelectorAll('.gallery-thumb');
  if (galleryMain && galleryThumbs.length) {
    const slides = galleryMain.querySelectorAll('.gallery-slide');
    const prevArrow = galleryMain.querySelector('.gallery-arrow.prev');
    const nextArrow = galleryMain.querySelector('.gallery-arrow.next');
    let currentSlide = 0;

    function showSlide(idx) {
      currentSlide = (idx + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
      galleryThumbs.forEach((t, i) => t.classList.toggle('active', i === currentSlide));
    }
    galleryThumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => showSlide(i));
    });
    if (prevArrow) prevArrow.addEventListener('click', () => showSlide(currentSlide - 1));
    if (nextArrow) nextArrow.addEventListener('click', () => showSlide(currentSlide + 1));
  }

  /* ---- PDP Variant selectors ---- */
  const pricingWrap = document.querySelector('.pdp-pricing');
  const pdpState = {
    qty: 1,
    plan: 'subscribe',
    basePrice: 34.99,
    subPrice: 26.24,
    sizeMult: 1
  };
  if (pricingWrap) {
    pdpState.basePrice = parseFloat(pricingWrap.dataset.baseOne) || pdpState.basePrice;
    pdpState.subPrice = parseFloat(pricingWrap.dataset.baseSub) || pdpState.subPrice;
  }
  // Read initial multiplier from any active size variant
  const initialSize = document.querySelector('[data-variant="size"].active');
  if (initialSize) {
    const m = parseFloat(initialSize.getAttribute('data-mult'));
    if (!isNaN(m)) pdpState.sizeMult = m;
  }

  function recomputePdpPrice() {
    const subTotal = +(pdpState.subPrice * pdpState.sizeMult * pdpState.qty).toFixed(2);
    const oneTotal = +(pdpState.basePrice * pdpState.sizeMult * pdpState.qty).toFixed(2);

    const subEl = document.querySelector('[data-price-sub]');
    const oneEl = document.querySelector('[data-price-one]');
    const ctaEl = document.querySelector('[data-cta-price]');
    if (subEl) subEl.textContent = `$${subTotal.toFixed(2)}`;
    if (oneEl) oneEl.textContent = `$${oneTotal.toFixed(2)}`;
    if (ctaEl) ctaEl.textContent = `$${(pdpState.plan === 'subscribe' ? subTotal : oneTotal).toFixed(2)}`;
  }

  document.querySelectorAll('[data-variant]').forEach(opt => {
    opt.addEventListener('click', () => {
      const variant = opt.getAttribute('data-variant');
      const value = opt.getAttribute('data-value');
      const mult = parseFloat(opt.getAttribute('data-mult'));
      if (variant === 'size' && !isNaN(mult)) pdpState.sizeMult = mult;

      const group = opt.parentElement;
      group.querySelectorAll('[data-variant]').forEach(s => s.classList.remove('active'));
      opt.classList.add('active');

      const labelEl = document.querySelector(`[data-selected="${variant}"]`);
      if (labelEl) labelEl.textContent = value;

      recomputePdpPrice();
    });
  });
  recomputePdpPrice();

  // Quantity stepper
  const qtyDisplay = document.querySelector('[data-qty]');
  const qtyDecr = document.querySelector('.qty-decr');
  const qtyIncr = document.querySelector('.qty-incr');
  if (qtyDisplay && qtyDecr && qtyIncr) {
    qtyDecr.addEventListener('click', () => {
      if (pdpState.qty > 1) { pdpState.qty--; qtyDisplay.textContent = pdpState.qty; recomputePdpPrice(); }
    });
    qtyIncr.addEventListener('click', () => {
      if (pdpState.qty < 10) { pdpState.qty++; qtyDisplay.textContent = pdpState.qty; recomputePdpPrice(); }
    });
  }

  // Pricing card selection
  document.querySelectorAll('[data-pricing]').forEach(card => {
    card.addEventListener('click', () => {
      pdpState.plan = card.getAttribute('data-pricing');
      document.querySelectorAll('[data-pricing]').forEach(c => c.classList.remove('featured'));
      card.classList.add('featured');
      recomputePdpPrice();
    });
  });

  /* ---- Staggered reveals ---- */
  if ('IntersectionObserver' in window) {
    const staggerObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          staggerObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-stagger]').forEach(el => staggerObs.observe(el));
  }

  /* ---- Count-up animation for stat percentages ---- */
  function animateCount(el, target, duration = 1400) {
    const start = performance.now();
    const isPct = el.dataset.countSuffix !== undefined ? false : (el.textContent.includes('%') || target <= 100);
    const suffix = el.dataset.countSuffix || (isPct ? '%' : '');
    const prefix = el.dataset.countPrefix || '';
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = `${prefix}${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const countObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          if (!isNaN(target)) animateCount(el, target);
          countObs.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(el => {
      // Set initial 0 visible
      const suffix = el.dataset.countSuffix || (parseFloat(el.dataset.count) <= 100 ? '%' : '');
      const prefix = el.dataset.countPrefix || '';
      el.textContent = `${prefix}0${suffix}`;
      countObs.observe(el);
    });
  }

  /* ---- Sticky PDP Add-to-Cart bar ---- */
  const pdpSticky = document.querySelector('.pdp-sticky-cta');
  const pdpHero = document.querySelector('.pdp-hero');
  if (pdpSticky && pdpHero) {
    function checkPdpSticky() {
      if (window.innerWidth >= 768) {
        pdpSticky.classList.remove('visible');
        document.body.classList.remove('has-mobile-cta');
        return;
      }
      const heroRect = pdpHero.getBoundingClientRect();
      // Show after the user has scrolled past the bottom of the hero
      const showBar = heroRect.bottom < 80;
      pdpSticky.classList.toggle('visible', showBar);
      document.body.classList.toggle('has-mobile-cta', showBar);
    }
    checkPdpSticky();
    window.addEventListener('scroll', checkPdpSticky, { passive: true });
    window.addEventListener('resize', checkPdpSticky, { passive: true });

    // Sync price + name from main PDP CTA
    function syncPdpStickyContent() {
      const mainCta = document.querySelector('.pdp-cta [data-add-cart]');
      if (!mainCta) return;
      const name = mainCta.getAttribute('data-product-name') || 'Product';
      const ctaPriceEl = mainCta.querySelector('[data-cta-price]');
      const price = ctaPriceEl ? ctaPriceEl.textContent.trim() : '';
      const nameEl = pdpSticky.querySelector('.info strong');
      const priceEl = pdpSticky.querySelector('.info .pricing strong');
      if (nameEl) nameEl.textContent = name;
      if (priceEl) priceEl.textContent = price;
    }
    syncPdpStickyContent();
    // Re-sync when variants change (price updates)
    document.querySelectorAll('[data-variant], .qty-incr, .qty-decr, [data-pricing]').forEach(el => {
      el.addEventListener('click', () => setTimeout(syncPdpStickyContent, 30));
    });

    // Sticky button = main Add to Cart
    const stickyBtn = pdpSticky.querySelector('button');
    if (stickyBtn) {
      stickyBtn.addEventListener('click', () => {
        const mainCta = document.querySelector('.pdp-cta [data-add-cart]');
        if (mainCta) mainCta.click();
      });
    }
  }

  /* ---- Modal (variant info popups) ---- */
  function injectModal() {
    if (document.querySelector('.modal-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">Title</h3>
        <button class="modal-close" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body"></div>
    `;
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
  }
  injectModal();

  function openModal(title, bodyHTML) {
    const overlay = document.querySelector('.modal-overlay');
    const modal = document.querySelector('.modal');
    if (!overlay || !modal) return;
    modal.querySelector('.modal-title').textContent = title || '';
    modal.querySelector('.modal-body').innerHTML = bodyHTML || '';
    overlay.classList.add('open');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    const modal = document.querySelector('.modal');
    if (!overlay || !modal) return;
    overlay.classList.remove('open');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.cart-drawer.open')) document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-modal-title]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const title = trigger.getAttribute('data-modal-title');
      const body = trigger.getAttribute('data-modal-body') || '';
      openModal(title, body);
    });
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.modal-close') || e.target.classList.contains('modal-overlay')) {
      closeModal();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  /* ---- Stock progress bar fill ---- */
  document.querySelectorAll('.stock-bar-fill').forEach(fill => {
    const pct = parseFloat(fill.dataset.stock);
    if (!isNaN(pct)) {
      fill.style.width = '0%';
      requestAnimationFrame(() => {
        setTimeout(() => { fill.style.width = pct + '%'; }, 300);
      });
    }
  });

  /* ---- Checkout page ---- */
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    const grid = document.getElementById('checkoutGrid');
    const emptyState = document.getElementById('checkoutEmpty');
    const successState = document.getElementById('checkoutSuccess');
    const itemsEl = document.getElementById('orderItems');
    const SHIPPING_FLAT = 5.99;
    let selectedPayment = 'cod';

    function renderCheckout() {
      if (cart.length === 0) {
        if (grid) grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      // Line items
      if (itemsEl) {
        itemsEl.innerHTML = cart.map(item => {
          const line = (item.price * item.qty).toFixed(2);
          return `
            <div class="order-item">
              <div class="order-item-thumb">
                <span class="glyph">${item.glyph || '✨'}</span>
                <span class="qty-badge">${item.qty}</span>
              </div>
              <div class="order-item-info">
                <strong>${item.name}</strong>
                <span>$${item.price.toFixed(2)} each</span>
              </div>
              <span class="order-item-price">$${line}</span>
            </div>
          `;
        }).join('');
      }

      const subtotal = getCartTotal();
      const freeShip = subtotal >= FREE_SHIP_THRESHOLD;
      const shipping = freeShip ? 0 : SHIPPING_FLAT;
      const discount = (selectedPayment === 'prepay') ? +(subtotal * 0.05).toFixed(2) : 0;
      const total = +(subtotal + shipping - discount).toFixed(2);

      const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
      set('[data-order-count]', getCartCount());
      set('[data-order-subtotal]', `$${subtotal.toFixed(2)}`);
      set('[data-order-shipping]', freeShip ? 'Free' : `$${shipping.toFixed(2)}`);
      set('[data-place-total]', `$${total.toFixed(2)}`);
      set('[data-order-total]', `$${total.toFixed(2)}`);

      const discountRow = document.querySelector('[data-discount-row]');
      const discountVal = document.querySelector('[data-order-discount]');
      if (discount > 0) {
        if (discountRow) discountRow.style.display = 'flex';
        if (discountVal) discountVal.textContent = `−$${discount.toFixed(2)}`;
      } else {
        if (discountRow) discountRow.style.display = 'none';
      }
    }
    renderCheckout();

    // Payment selection
    document.querySelectorAll('.payment-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        if (opt.classList.contains('disabled')) {
          e.preventDefault();
          return;
        }
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        selectedPayment = opt.getAttribute('data-payment') || 'cod';
        renderCheckout();
      });
    });

    // Submit
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Native required-field check
      const required = checkoutForm.querySelectorAll('[required]');
      let firstInvalid = null;
      required.forEach(f => {
        if (!f.value.trim()) {
          f.style.borderColor = 'var(--warn)';
          if (!firstInvalid) firstInvalid = f;
        } else {
          f.style.borderColor = '';
        }
      });
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Generate order ID + show success
      const orderId = 'ZS-' + Date.now().toString(36).toUpperCase().slice(-6);
      const idEl = document.getElementById('orderId');
      if (idEl) idEl.textContent = orderId;

      if (grid) grid.style.display = 'none';
      if (successState) successState.style.display = 'block';

      // Clear cart
      cart.length = 0;
      saveCart();
      document.querySelectorAll('.cart-count').forEach(el => el.textContent = '0');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Checkout page ---- */
  const checkoutForm = document.getElementById('checkoutForm');
  const checkoutGrid = document.getElementById('checkoutGrid');
  const checkoutEmpty = document.getElementById('checkoutEmpty');
  const checkoutSuccess = document.getElementById('checkoutSuccess');

  if (checkoutForm && checkoutGrid) {
    const CK_SHIP_THRESHOLD = 50;
    const CK_SHIP_COST = 5.99;
    const PREPAY_DISCOUNT = 0.05;

    function getCkPayment() {
      const sel = document.querySelector('.payment-option.selected');
      return sel ? sel.getAttribute('data-payment') : 'cod';
    }

    function renderCheckout() {
      if (cart.length === 0) {
        checkoutGrid.style.display = 'none';
        if (checkoutEmpty) checkoutEmpty.style.display = 'block';
        return;
      }

      const itemsEl = document.getElementById('orderItems');
      if (itemsEl) {
        itemsEl.innerHTML = cart.map(item => `
          <div class="order-item">
            <div class="order-item-thumb">
              <span class="glyph">${item.glyph || '✨'}</span>
              <span class="qty-badge">${item.qty}</span>
            </div>
            <div class="order-item-info">
              <strong>${item.name}</strong>
              <span>$${item.price.toFixed(2)} each</span>
            </div>
            <span class="order-item-price">$${(item.price * item.qty).toFixed(2)}</span>
          </div>
        `).join('');
      }

      const countEl = document.querySelector('[data-order-count]');
      if (countEl) countEl.textContent = getCartCount();

      const subtotal = getCartTotal();
      const shipping = subtotal >= CK_SHIP_THRESHOLD ? 0 : CK_SHIP_COST;
      const payment = getCkPayment();
      const discount = payment === 'prepay' ? subtotal * PREPAY_DISCOUNT : 0;
      const total = Math.max(0, subtotal + shipping - discount);

      const subEl = document.querySelector('[data-order-subtotal]');
      const shipEl = document.querySelector('[data-order-shipping]');
      const discRow = document.querySelector('[data-discount-row]');
      const discEl = document.querySelector('[data-order-discount]');
      const totalEl = document.querySelector('[data-order-total]');
      const placeEl = document.querySelector('[data-place-total]');
      if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
      if (shipEl) shipEl.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
      if (discRow) {
        if (discount > 0) {
          discRow.style.display = 'flex';
          if (discEl) discEl.textContent = `−$${discount.toFixed(2)}`;
        } else {
          discRow.style.display = 'none';
        }
      }
      if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
      if (placeEl) placeEl.textContent = `$${total.toFixed(2)}`;
    }

    // Payment option selection (skip disabled)
    document.querySelectorAll('.payment-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        if (opt.classList.contains('disabled')) {
          e.preventDefault();
          return;
        }
        document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        renderCheckout();
      });
    });

    // Form submit (mock — no real backend yet)
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Generate a friendly-looking order ID
      const orderId = 'ZS-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderIdEl = document.getElementById('orderId');
      if (orderIdEl) orderIdEl.textContent = orderId;

      checkoutGrid.style.display = 'none';
      if (checkoutSuccess) checkoutSuccess.style.display = 'block';

      // Clear cart
      cart = [];
      saveCart();
      document.querySelectorAll('.cart-count').forEach(el => el.textContent = '0');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    renderCheckout();
  }

  /* ---- Feature accordion (Why Zora) ---- */
  document.querySelectorAll('.feature-item').forEach(item => {
    const toggle = item.querySelector('.feature-item-toggle');
    const body = item.querySelector('.feature-item-body');
    if (!toggle || !body) return;
    if (item.classList.contains('open')) {
      requestAnimationFrame(() => { body.style.maxHeight = body.scrollHeight + 'px'; });
    }
    toggle.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      const list = item.parentElement;
      list.querySelectorAll('.feature-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          const ob = other.querySelector('.feature-item-body');
          if (ob) ob.style.maxHeight = '0';
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        body.style.maxHeight = '0';
      } else {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

});
