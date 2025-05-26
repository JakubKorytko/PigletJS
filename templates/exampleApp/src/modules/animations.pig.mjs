const animations = {
  rotate: {
    frames: [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],

    options: {
      easing: "ease-in-out",
      duration: 500,
      fill: "forwards",
    },
  },

  grow: {
    frames: [
      { transform: "scale(1)" },
      { transform: "scale(1.1)" },
      { transform: "scale(1)" },
    ],

    options: {
      duration: 200,
      easing: "ease-in-out",
    },
  },

  fadeIn: {
    frames: [{ opacity: 0 }, { opacity: 1 }],

    options: {
      duration: 300,
      easing: "ease-in-out",
    },
  },
};

export default animations;
