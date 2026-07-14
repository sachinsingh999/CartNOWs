export const triggerFlyToCart = (startX, startY, imgUrl) => {
  const cartBtn = document.getElementById("navbar-cart-btn");
  if (!cartBtn) return;
  const cartRect = cartBtn.getBoundingClientRect();
  const endX = cartRect.left + cartRect.width / 2;
  const endY = cartRect.top + cartRect.height / 2;

  const flyEl = document.createElement("div");
  flyEl.style.position = "fixed";
  flyEl.style.left = `${startX}px`;
  flyEl.style.top = `${startY}px`;
  flyEl.style.width = "42px";
  flyEl.style.height = "42px";
  flyEl.style.borderRadius = "50%";
  flyEl.style.overflow = "hidden";
  flyEl.style.zIndex = "99999";
  flyEl.style.pointerEvents = "none";
  flyEl.style.border = "2.5px solid #F43F5E";
  flyEl.style.boxShadow = "0 4px 20px rgba(244, 63, 94, 0.45)";
  flyEl.style.transform = "translate(-50%, -50%) scale(1)";
  
  const imgEl = document.createElement("img");
  imgEl.src = imgUrl;
  imgEl.style.width = "100%";
  imgEl.style.height = "100%";
  imgEl.style.objectFit = "cover";
  flyEl.appendChild(imgEl);

  document.body.appendChild(flyEl);

  const keyframes = [
    {
      left: `${startX}px`,
      top: `${startY}px`,
      transform: "translate(-50%, -50%) scale(1) rotate(0deg)",
      opacity: 1
    },
    {
      left: `${startX + (endX - startX) * 0.4}px`,
      top: `${Math.min(startY, endY) - 140}px`,
      transform: "translate(-50%, -50%) scale(1.35) rotate(180deg)",
      opacity: 0.95
    },
    {
      left: `${endX}px`,
      top: `${endY}px`,
      transform: "translate(-50%, -50%) scale(0.1) rotate(360deg)",
      opacity: 0.1
    }
  ];

  const animation = flyEl.animate(keyframes, {
    duration: 850,
    easing: "cubic-bezier(0.25, 1, 0.5, 1)"
  });

  animation.onfinish = () => {
    flyEl.remove();
    window.dispatchEvent(new Event("cartAddAnimComplete"));
  };
};
