import React, { useState } from "react";
import UpdateDropdownModal from "./UpdateDropdownModal";
import { Button } from "../ui/button";
import Image from "next/image";
import { Edit } from "lucide-react";

const EditButtonProductTable = ({ _id }: { _id: string }) => {
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 max-md:ml-auto"
        onClick={() => setIsOpenUpdateModal(true)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <UpdateDropdownModal
        _id={_id}
        isOpenUpdateModal={isOpenUpdateModal}
        setIsOpenUpdateModal={setIsOpenUpdateModal}
      ></UpdateDropdownModal>
    </>
  );
};

export default EditButtonProductTable;
