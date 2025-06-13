"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Image from "next/image";

import DeleteDropdownModal from "./DeleteDropdownModal";
import UpdateDropdownModal from "./UpdateDropdownModal";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";

const ProductCardDropdown = ({ _id }: { _id: string }) => {
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 md:h-8 md:w-8 rounded-full bg-white shadow-md"
          >
            <MoreHorizontal className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32" side="bottom" align="end">
          <DropdownMenuLabel>More</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="flex flex-col gap-0 hover:bg-transparent">
            <DropdownMenuItem
              className=" -px-2"
              onClick={() => setIsOpenDeleteModal(true)}
            >
              <div className="flex  w-full h-full items-center p-2 py-1  rounded-md ">
                <Image
                  alt="delete icon"
                  src="/assets/delete.svg"
                  width={20}
                  height={20}
                  className="mr-1  w-5 h-5 "
                ></Image>
                <span className="mt-1">Delete</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="-px-2"
              onClick={() => setIsOpenUpdateModal(true)}
            >
              <div className="flex  w-full h-full items-center p-2 py-1  rounded-md ">
                <Image
                  alt="update icon"
                  src="/assets/update.svg"
                  width={10}
                  height={10}
                  className="ml-1 mr-1  w-4 h-4 "
                ></Image>
                <span className="mt-1">Update</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* These modals will open when the dropdown items are clicked */}
      <DeleteDropdownModal
        _id={_id}
        isOpenDeleteModal={isOpenDeleteModal}
        setIsOpenDeleteModal={setIsOpenDeleteModal}
      ></DeleteDropdownModal>
      <UpdateDropdownModal
        _id={_id}
        isOpenUpdateModal={isOpenUpdateModal}
        setIsOpenUpdateModal={setIsOpenUpdateModal}
      ></UpdateDropdownModal>
    </>
  );
};

export default ProductCardDropdown;
