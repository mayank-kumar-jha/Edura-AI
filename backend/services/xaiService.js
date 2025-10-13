function getExplanation(score, features, ipResult) {
  const reasons = [];

  // Primary Indicators
  if (features.pasteCount > 0) {
    reasons.push(
      "data was pasted into the form, a strong indicator of automated activity"
    );
  }
  if (ipResult.isInconsistent) {
    reasons.push(
      `a significant geographic jump of approximately ${
        ipResult.reason.split(" ")[4]
      } km was detected`
    );
  }

  if (reasons.length > 0) {
    return `This event was flagged with high confidence because ${reasons.join(
      " and "
    )}.`;
  }

  // Secondary "Combination" Indicators
  if (score > 0.6) {
    if (features.timeToComplete < 5 && features.keyPressCount > 10) {
      reasons.push("the submission was completed much faster than average");
    }
    if (features.keyPressSpeed > 10 && features.keyPressCount > 20) {
      reasons.push(
        "the typing speed was significantly faster than a typical user"
      );
    }
    if (features.errorRate > 0.25 && features.keyPressCount > 20) {
      reasons.push("a high rate of corrections were made");
    }
  }

  // Final Decision
  if (score <= 0.6) {
    return "Behavioral patterns appear normal and consistent with a genuine user.";
  }

  if (reasons.length > 0) {
    return `This event was flagged for review because ${reasons.join(
      ", and "
    )}.`;
  }

  return "The AI model detected a combination of subtle behavioral patterns that deviate from the norm. A manual review is recommended.";
}

module.exports = {
  getExplanation,
};
