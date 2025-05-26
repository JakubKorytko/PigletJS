const performanceWrapper = function (label, method) {
  return function (callback) {
    console.profile(label);
    console.time(label);
    const start = performance.now();

    method();

    console.profileEnd(label);
    console.timeEnd(label);
    const end = performance.now();

    const duration = Math.round(end - start);
    if (typeof callback === "function") {
      callback(duration);
    }
  };
};

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

export { performanceWrapper, createPerformanceWrapper };
