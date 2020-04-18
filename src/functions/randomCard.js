const randomCard = () => {
  let words = [
    "cool.",
    "chilly.",
    `frigid.`,
    `for dummies.`,
    "frosty.",
    `refreshing.`,
    `the reason i got access to valorant.`,
    `arctic.`,
    "my destiny.",
    "completely fooling you.",
    "my dreams come true.",
    `air-conditioned.`,
    `my girlfriend's new boyfriend.`,
  ];
  return words[Math.floor(Math.random() * words.length)];
};

export default randomCard;
