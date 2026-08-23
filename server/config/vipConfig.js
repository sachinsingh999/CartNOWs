export const VIP_CONFIG = {
  period: "annual", // Annual qualification window
  periodDays: 365,
  levels: [
    {
      key: "MEMBER",
      name: "Member",
      minSpend: 0,
      maxSpend: 4999,
      cashbackRate: 0.01, // 1%
      pointsMultiplier: 1.0, // 1x
      theme: "slate",
      benefits: [
        "1.0% Cashback on completed purchases",
        "1.0x Base Reward Points earning rate",
        "Standard customer support",
        "Access to seasonal flash sales"
      ]
    },
    {
      key: "SILVER",
      name: "Silver",
      minSpend: 5000,
      maxSpend: 19999,
      cashbackRate: 0.02, // 2%
      pointsMultiplier: 1.25, // 1.25x
      theme: "silver",
      benefits: [
        "2.0% Cashback on completed purchases",
        "1.25x Reward Points multiplier",
        "Early access to flash sales",
        "Priority email support ticket handling"
      ]
    },
    {
      key: "GOLD",
      name: "Gold",
      minSpend: 20000,
      maxSpend: 49999,
      cashbackRate: 0.04, // 4%
      pointsMultiplier: 1.5, // 1.5x
      theme: "gold",
      benefits: [
        "4.0% Cashback on completed purchases",
        "1.5x Reward Points multiplier",
        "Free shipping on all orders",
        "Exclusive Gold member catalog discounts"
      ]
    },
    {
      key: "BLACK_VIP",
      name: "Black VIP",
      minSpend: 50000,
      maxSpend: 99999,
      cashbackRate: 0.08, // 8%
      pointsMultiplier: 2.0, // 2x
      theme: "black",
      benefits: [
        "8.0% Cashback on completed purchases",
        "2.0x Reward Points multiplier",
        "Dedicated VIP Concierge Support",
        "Exclusive Black VIP previews & invite-only sales"
      ]
    },
    {
      key: "DIAMOND_VIP",
      name: "Diamond VIP",
      minSpend: 100000,
      maxSpend: Infinity,
      cashbackRate: 0.12, // 12%
      pointsMultiplier: 3.0, // 3x
      theme: "diamond",
      benefits: [
        "12.0% Cashback on completed purchases",
        "3.0x Reward Points multiplier",
        "24/7 Personal Account Manager",
        "Complimentary 1-day express delivery everywhere",
        "Invitations to luxury offline brand events"
      ]
    }
  ]
};

export const getVipLevelConfig = (qualifyingSpend = 0) => {
  const spend = Math.max(0, Number(qualifyingSpend) || 0);
  const levels = VIP_CONFIG.levels;

  for (let i = levels.length - 1; i >= 0; i--) {
    if (spend >= levels[i].minSpend) {
      const currentLevel = levels[i];
      const nextLevel = levels[i + 1] || null;

      let amountToNextLevel = 0;
      let progressPercent = 100;

      if (nextLevel) {
        amountToNextLevel = Math.max(0, nextLevel.minSpend - spend);
        const range = nextLevel.minSpend - currentLevel.minSpend;
        const progressInRange = spend - currentLevel.minSpend;
        progressPercent = Math.min(100, Math.max(0, Math.round((progressInRange / range) * 100)));
      }

      return {
        level: currentLevel.key,
        levelName: currentLevel.name,
        minSpend: currentLevel.minSpend,
        maxSpend: currentLevel.maxSpend,
        cashbackRate: currentLevel.cashbackRate,
        pointsMultiplier: currentLevel.pointsMultiplier,
        theme: currentLevel.theme,
        benefits: currentLevel.benefits,
        qualifyingSpend: spend,
        nextLevel: nextLevel ? nextLevel.key : null,
        nextLevelName: nextLevel ? nextLevel.name : null,
        nextLevelMinSpend: nextLevel ? nextLevel.minSpend : null,
        amountToNextLevel,
        progressPercent
      };
    }
  }

  // Fallback to Member
  const base = levels[0];
  return {
    level: base.key,
    levelName: base.name,
    minSpend: base.minSpend,
    maxSpend: base.maxSpend,
    cashbackRate: base.cashbackRate,
    pointsMultiplier: base.pointsMultiplier,
    theme: base.theme,
    benefits: base.benefits,
    qualifyingSpend: spend,
    nextLevel: levels[1].key,
    nextLevelName: levels[1].name,
    nextLevelMinSpend: levels[1].minSpend,
    amountToNextLevel: levels[1].minSpend - spend,
    progressPercent: Math.round((spend / levels[1].minSpend) * 100)
  };
};
