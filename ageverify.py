#!/usr/bin/env python3

"""
Console-based age verification questionnaire.

The script walks a user through several prompts, performs basic validation,
and prints the final verification decision alongside the captured answers.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional


class QuestionnaireError(Exception):
    """Raised when the questionnaire cannot proceed due to invalid input."""


@dataclass
class QuestionnaireResult:
    """Represents the outcome of the age verification questionnaire."""

    full_name: str
    date_of_birth: date
    claimed_age: int
    has_guardian_consent: Optional[bool]
    purpose: str
    verification_passed: bool
    failure_reason: Optional[str] = None

    def summary(self) -> str:
        consent_str = (
            "yes" if self.has_guardian_consent else "no" if self.has_guardian_consent is not None else "n/a"
        )
        status = "APPROVED" if self.verification_passed else "REJECTED"

        lines = [
            "",
            "========================================",
            f"Verification status: {status}",
            "Captured information:",
            f"  - Name: {self.full_name}",
            f"  - Date of birth: {self.date_of_birth.isoformat()}",
            f"  - Claimed age: {self.claimed_age}",
            f"  - Guardian consent: {consent_str}",
            f"  - Purpose: {self.purpose or 'n/a'}",
        ]
        if not self.verification_passed and self.failure_reason:
            lines.append(f"  - Failure reason: {self.failure_reason}")
        lines.append("========================================")
        return "\n".join(lines)


def prompt_non_empty(prompt: str) -> str:
    while True:
        value = input(prompt).strip()
        if value:
            return value
        print("Input cannot be empty. Please try again.")


def prompt_yes_no(prompt: str) -> bool:
    valid = {"y": True, "yes": True, "n": False, "no": False}
    while True:
        answer = input(prompt + " [y/n]: ").strip().lower()
        if answer in valid:
            return valid[answer]
        print("Please respond with 'y', 'yes', 'n', or 'no'.")


def prompt_integer(prompt: str, minimum: Optional[int] = None, maximum: Optional[int] = None) -> int:
    while True:
        raw = input(prompt).strip()
        try:
            value = int(raw, 10)
        except ValueError:
            print("Please enter a whole number.")
            continue

        if minimum is not None and value < minimum:
            print(f"Value must be at least {minimum}.")
            continue
        if maximum is not None and value > maximum:
            print(f"Value must be at most {maximum}.")
            continue
        return value


def prompt_birth_date(prompt: str = "Enter your date of birth (YYYY-MM-DD): ") -> date:
    while True:
        raw = input(prompt).strip()
        try:
            dob = datetime.strptime(raw, "%Y-%m-%d").date()
        except ValueError:
            print("Invalid date format. Please use YYYY-MM-DD.")
            continue

        today = date.today()
        if dob > today:
            print("Date of birth cannot be in the future.")
            continue
        if (today.year - dob.year) > 120:
            print("Entered age seems unrealistic. Please double-check.")
            continue
        return dob


def calculate_age(born: date, reference: Optional[date] = None) -> int:
    ref = reference or date.today()
    years = ref.year - born.year
    if (ref.month, ref.day) < (born.month, born.day):
        years -= 1
    return years


def run_questionnaire() -> QuestionnaireResult:
    print("=== Age Verification Questionnaire ===")
    print("Please answer the following questions honestly.")
    print("----------------------------------------")

    name = prompt_non_empty("Full name: ")
    dob = prompt_birth_date()
    auto_age = calculate_age(dob)
    claimed_age = prompt_integer(f"Confirm your age ({auto_age} calculated): ", minimum=0, maximum=150)

    has_guardian_consent = None
    if claimed_age < 18:
        has_guardian_consent = prompt_yes_no("Do you have verifiable parental/guardian consent?")

    purpose = input("What is your reason for requesting access? ").strip()

    verification_passed = False
    failure_reason = None

    if claimed_age != auto_age:
        failure_reason = "Claimed age does not match date of birth."
    elif claimed_age < 13:
        failure_reason = "Users under 13 are not permitted."
    elif claimed_age < 18 and not has_guardian_consent:
        failure_reason = "Guardian consent required for minors."
    else:
        verification_passed = True

    return QuestionnaireResult(
        full_name=name,
        date_of_birth=dob,
        claimed_age=claimed_age,
        has_guardian_consent=has_guardian_consent,
        purpose=purpose,
        verification_passed=verification_passed,
        failure_reason=failure_reason,
    )


def main() -> None:
    try:
        result = run_questionnaire()
    except KeyboardInterrupt:
        print("\nQuestionnaire interrupted by user.")
        raise SystemExit(1)
    except QuestionnaireError as exc:
        print(f"Questionnaire failed: {exc}")
        raise SystemExit(1)

    print(result.summary())


if __name__ == "__main__":
    main()

