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

export default function OnboardingModal() {
  const { isOpen, openModal, closeModal } = useModal(true);
  // const handleSave = () => {
  //   // Handle save logic here
  //   console.log("Saving changes...");
  //   closeModal();
  // };
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
              <Input id="role" name="role" type="text" placeholder="Client" />
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
