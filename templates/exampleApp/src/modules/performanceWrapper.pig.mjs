const createPerformanceWrapper = function (label) {
  let startTime = null;

  return {
    start() {
      console.profile(label);
      console.time(label);
      startTime = performance.now();
    },
    end(callback) {
      const endTime = performance.now();
      console.profileEnd(label);
      console.timeEnd(label);
      const duration = Math.round(endTime - startTime);
      if (typeof callback === "function") {
        callback(duration);
      }
    },
  };
};

export { createPerformanceWrapper };
