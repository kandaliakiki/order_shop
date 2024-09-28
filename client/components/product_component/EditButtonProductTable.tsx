import React, { useState } from "react";
import UpdateDropdownModal from "./UpdateDropdownModal";
import { Button } from "../ui/button";
import Image from "next/image";

const EditButtonProductTable = ({ _id }: { _id: string }) => {
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  return (
    <>
      <Image
        alt="edit"
        src="/assets/edit-black.svg"
        width={18}
        height={18}
        className="min-w-[24px] min-h-[24px] cursor-pointer"
        onClick={() => setIsOpenUpdateModal(true)}
      ></Image>{" "}
      <UpdateDropdownModal
        _id={_id}
        isOpenUpdateModal={isOpenUpdateModal}
        setIsOpenUpdateModal={setIsOpenUpdateModal}
      ></UpdateDropdownModal>
    </>
  );
};

export default EditButtonProductTable;
