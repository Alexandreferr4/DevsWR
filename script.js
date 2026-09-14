const projects = [...document.querySelectorAll('.project')];

const prefersMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

if (prefersMotion && window.gsap) {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const scrollFadeTargets = gsap.utils.toArray(
    '.hero-copy, .hero-sheet, .project, .process-heading, .process-steps, .contact-copy, .contact-link'
  );
  let fadeFrame;

  const updateScrollOpacity = () => {
    fadeFrame = undefined;
    scrollFadeTargets.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      let edgeOpacity = 1;

      // Só suaviza o conteúdo quando ele atravessa as bordas da viewport.
      // No centro da tela, a opacidade permanece integral.
      if (bounds.top < 130) edgeOpacity = Math.min(edgeOpacity, (bounds.top + 130) / 130);
      if (bounds.bottom > window.innerHeight - 130) {
        edgeOpacity = Math.min(
          edgeOpacity,
          (window.innerHeight + 130 - bounds.bottom) / 130
        );
      }

      const opacity = gsap.utils.clamp(0.68, 1, edgeOpacity);
      gsap.set(element, { opacity });
    });
  };

  const requestScrollOpacity = () => {
    if (fadeFrame === undefined) fadeFrame = requestAnimationFrame(updateScrollOpacity);
  };

  window.addEventListener('scroll', requestScrollOpacity, { passive: true });
  window.addEventListener('resize', requestScrollOpacity, { passive: true });

  gsap.from('.hero-copy > *', {
    y: 24,
    duration: 0.75,
    stagger: 0.1,
    ease: 'power3.out',
    clearProps: 'transform'
  });

  gsap.from('.hero-sheet', {
    y: 34,
    rotate: 0,
    opacity: 0,
    duration: 1.05,
    ease: 'power3.out',
    delay: 0.15
  });

  gsap.utils.toArray('.reveal').forEach((element) => {
    gsap.from(element, {
      y: 28,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: element, start: 'top 84%', once: true }
    });
    gsap.from(element.querySelectorAll('.project-trigger > *'), {
      y: 12,
      duration: 0.45,
      stagger: 0.06,
      ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 84%', once: true }
    });
  });

  gsap.utils.toArray('.contact-copy > *, .contact-link').forEach((element) => {
    gsap.from(element, {
      y: 22,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: { trigger: element, start: 'top 88%', once: true }
    });
  });

  const processSteps = gsap.utils.toArray('.process-step');
  if (processSteps.length) {
    // Cada card tem seu próprio gatilho. Assim a sequência acontece mesmo
    // quando os três cards entram na viewport ao mesmo tempo.
    processSteps.forEach((step, index) => {
      gsap.to(step, {
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.72,
        delay: index * 0.3,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: step,
          start: 'top 82%',
          once: true
        }
      });
    });
  }

  gsap.to('.hero-sheet', {
    yPercent: -7,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=150%', scrub: 0.8 }
  });

  const heroSheet = document.querySelector('.hero-sheet');
  const sheetBefore = document.querySelector('.sheet-before');
  const sheetAfter = document.querySelector('.sheet-after');
  const sheetDivider = document.querySelector('.sheet-divider');
  const sheetProgress = document.querySelector('.sheet-progress i');
  const beforeAnnotations = document.querySelectorAll('.sheet-before .before-note, .sheet-before .before-topline');

  if (heroSheet && sheetBefore && sheetAfter && sheetDivider) {
    gsap.to({ progress: 0 }, {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: '+=150%',
        pin: true,
        pinSpacing: true,
        scrub: 0.7,
        onUpdate: (self) => {
          // A transição termina antes do pin acabar; só então a hero é liberada
          // para continuar descendo e revelar o restante da página.
          const progress = gsap.utils.clamp(0, 1, self.progress / 0.68);
          const split = progress * 100;
          gsap.set(sheetBefore, { clipPath: `inset(0 ${split}% 0 0)` });
          gsap.set(sheetAfter, { clipPath: `inset(0 ${100 - split}% 0 0)` });
          gsap.set(sheetDivider, { left: `${split}%` });
          // As anotações pertencem apenas ao estado "antes" e somem assim
          // que a transição começa, evitando que atravessem o novo site.
          if (beforeAnnotations.length) {
            const annotationOpacity = gsap.utils.clamp(0, 1, 1 - progress / 0.12);
            gsap.set(beforeAnnotations, { opacity: annotationOpacity });
          }
          if (sheetProgress) gsap.set(sheetProgress, { width: `${split}%` });
        }
      }
    });
  }

  const projectsCarousel = document.querySelector('.projects-scroll');
  const projectTrack = document.querySelector('.project-list');
  const scrollLine = document.querySelector('.projects-scroll-line i');
  const projectsIntro = document.querySelector('.section-intro');

  if (projectsCarousel && projectTrack && window.matchMedia('(min-width: 701px)').matches) {
    const getDistance = () => {
      const lastCard = projectTrack.lastElementChild;
      if (!lastCard) return 0;

      // Calcula o deslocamento pela posição renderizada do último card. Isso
      // considera o padding do carrossel e garante que o card inteiro fique
      // dentro da viewport no ponto final.
      const carouselBounds = projectsCarousel.getBoundingClientRect();
      const lastCardBounds = lastCard.getBoundingClientRect();
      const rightInset = 30;
      return Math.max(0, lastCardBounds.right - (carouselBounds.right - rightInset));
    };

    // O espaço vertical é reservado pelo próprio trigger; o carrossel ocupa
    // a largura da viewport e acompanha o scroll para cima e para baixo.
    gsap.to(projectTrack, {
      x: () => -getDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: projectsCarousel,
        start: () => `top top+=${Math.ceil(projectsIntro?.offsetHeight || 0)}`,
        end: () => `+=${getDistance() + window.innerHeight * 0.8}`,
        pin: projectsCarousel,
        pinSpacing: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onEnter: () => gsap.set(projectsIntro, { opacity: 1, filter: "none" }),
        onEnterBack: () => gsap.set(projectsIntro, { opacity: 1, filter: "none" }),
        onLeave: () => gsap.set(projectsIntro, { opacity: 0, filter: "blur(5px)", }),
        onLeaveBack: () => gsap.set(projectsIntro, { opacity: 1, filter: "none" }),
        onUpdate: (self) => {
          if (scrollLine) gsap.set(scrollLine, { width: `${Math.max(33, self.progress * 100)}%` });
          if (projectsIntro) {
            // O título permanece até o último card terminar sua entrada.
            const introOpacity = gsap.utils.clamp(0, 1, 1 - Math.max(0, self.progress - 0.96) / 0.04);
            gsap.set(projectsIntro, { opacity: introOpacity });
          }
          requestScrollOpacity();
        }
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      gsap.to(window, { duration: 0.65, scrollTo: { y: target, offsetY: 18 }, ease: 'power2.out' });
    });
  });
}

function initThreeScene() {
  const canvas = document.querySelector('.hero-canvas');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.z = 5;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const group = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(1.1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xed6a39, wireframe: true, transparent: true, opacity: 0.72 });
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);
  scene.add(group);

  const resize = () => {
    const bounds = canvas.parentElement.getBoundingClientRect();
    renderer.setSize(bounds.width, bounds.height, false);
    camera.aspect = bounds.width / bounds.height;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  if (prefersMotion) {
    gsap.to(mesh.rotation, { x: Math.PI * 2, y: Math.PI * 2, duration: 18, repeat: -1, ease: 'none' });
    gsap.to(group.position, { y: 0.08, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }

  const render = () => { renderer.render(scene, camera); requestAnimationFrame(render); };
  render();
}

if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', initThreeScene);
else initThreeScene();

projects.forEach((project) => {
  const trigger = project.querySelector('.project-trigger');
  const detail = project.querySelector('.project-detail');

  trigger.addEventListener('click', () => {
    const isActive = project.classList.contains('project-active');

    projects.forEach((item) => {
      item.classList.remove('project-active');
      item.querySelector('.project-trigger').setAttribute('aria-expanded', 'false');
      item.querySelector('.project-detail').hidden = true;
    });

    if (!isActive) {
      project.classList.add('project-active');
      trigger.setAttribute('aria-expanded', 'true');
      detail.hidden = false;
    }
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('is-open', !isOpen);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  });
});

const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  formStatus?.classList.remove('is-success', 'is-error');

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    if (formStatus) {
      formStatus.textContent = 'Preencha seu nome, telefone e informe se o site é empresarial ou pessoal.';
      formStatus.classList.add('is-error');
    }
    return;
  }

  const data = new FormData(contactForm);
  const message = [
    'Olá! Gostaria de conversar sobre um site.',
    '',
    `Nome: ${data.get('nome')}`,
    `Telefone: ${data.get('telefone')}`,
    `E-mail: ${data.get('email') || 'Não informado'}`,
    `Site para: ${data.get('publico')}`,
    `Site ou Instagram atual: ${data.get('siteAtual') || 'Não informado'}`,
    `Objetivo do site: ${data.get('objetivo') || 'Não informado'}`
  ].join('\n');

  const whatsappUrl = `https://wa.me/5537999273836?text=${encodeURIComponent(message)}`;
  const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  if (whatsappWindow) {
    if (formStatus) {
      formStatus.textContent = 'Dados preparados. O WhatsApp foi aberto para enviar a mensagem.';
      formStatus.classList.add('is-success');
    }
    contactForm.reset();
  } else if (formStatus) {
    formStatus.textContent = 'Não foi possível abrir o WhatsApp. Verifique o bloqueador de pop-ups e tente novamente.';
    formStatus.classList.add('is-error');
  }
});
