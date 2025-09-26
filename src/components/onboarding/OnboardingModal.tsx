"use client";
import React from "react";
import { useModal } from "@/hooks/useModal";
import ComponentCard from "../common/ComponentCard";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import SubmitButton from "../ui/submitButton/SubmitButton";
import { onboardProfile } from "@/app/login/actions";
import Select from "../form/Select";
import { ChevronDownIcon } from "@/icons";

export default function OnboardingModal() {
  const [selectedRole, setSelectedRole] = React.useState("");
  const options = [
    { value: "Client", label: "Student" },
    {value: "Tutor", label: "Tutor/Advisor"}
  ]
  const { isOpen, openModal, closeModal } = useModal(true);
  return (
    <ComponentCard title="Form In Modal">
      <Button size="sm" onClick={openModal}>
        Open Modal
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[584px] p-5 lg:p-10"
      >
          <h3 className="mb-2 text-xl font-medium text-gray-800 dark:text-white/90">
            Welcome to MatchPal
          </h3>
          <p className="mb-6 text-md font-thin text-gray-800 dark:text-white/90">
            Tell us about yourself so we can customize your Matchpal experience
          </p>

        <form className="">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="col-span-1">
              <Label>First Name</Label>
              <Input id="first_name" name="first_name" type="text" placeholder="First Name" />
            </div>

            <div className="col-span-1">
              <Label>Last Name</Label>
              <Input id="last_name" name="last_name" type="text" placeholder="Last Name" />
            </div>

            <div className="col-span-1">
              <Label>Phone Number</Label>
              <Input id="phone" name="phone" type="phone" placeholder="(xxx) xxx-xxxx" />
            </div>

            <div className="col-span-1">
              <Label>Role</Label>
              <div className="relative">
                <Select
                  options={options}
                  placeholder="Select an option"
                  onChange={setSelectedRole}
                  className="dark:bg-dark-900"
                />
                {/* Hidden input to pass the selected value as form data */}
                <input type="hidden" name="role" value={selectedRole} />
                <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <ChevronDownIcon/>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end w-full gap-3 mt-6">
            <SubmitButton formAction={onboardProfile} size="sm">
              Save and Continue
            </SubmitButton>
          </div>
        </form>
      </Modal>
    </ComponentCard>
  );
}
