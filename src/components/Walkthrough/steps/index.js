import DashboardSteps from "./DashboardSteps";

const regexes = [
  DashboardSteps.stepsPath,
];

const steps = [
  DashboardSteps.steps
]

const handlers = [
  DashboardSteps.callbackClosure
]

export const getSteps = (pathname) => {
  let count = 0;
  for (let regex of regexes) {
    if (regex.test(pathname)) {
      return steps[count]
    }
    count += 1;
  }
};

export const getCallbackHandler = (pathname, actions) => {
  let count = 0;
  for (let regex of regexes) {
    if (regex.test(pathname)) {
      return handlers[count](actions)
    }
    count += 1;
  }
}
