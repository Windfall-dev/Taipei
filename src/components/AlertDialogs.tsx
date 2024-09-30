"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import React, { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RankingUserProps, useAddPoints } from "@/hooks/useAddPoints";
import { useAuth } from "@/hooks/useAuth";
import { useTransaction } from "@/hooks/useTransaction";

import Loading from "./Loading";
import PopupResultDeposit from "./PopupResultDeposit";

type DialogState =
  | "none"
  | "confirm"
  | "loading"
  | "depositResult"
  | "withdrawResult"
  | "error";

const MAX_DEPOSIT_AMOUNT = 0.01;

interface AlertProp {
  actionType: "deposit" | "withdraw";
  amount: string;
}

export function AlertDialogs({ actionType, amount }: AlertProp) {
  const [dialogState, setDialogState] = useState<DialogState>("none");

  const context = useAuth();
  const { publicKey, sendTransaction } = useWallet();
  const { handleAddPoints, user, setUser } = useAddPoints();
  const { runTransaction } = useTransaction({
    publicKey,
    sendTransaction,
    actionType,
    amount,
    contextUserId: context.userId,
    handleAddPoints,
    MAX_DEPOSIT_AMOUNT,
  });

  const userId = context.userId.slice(0, 4) + ".." + context.userId.slice(-4);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_FAST_API_URL}/api/rankings`,
          {
            method: "GET",
          },
        );
        const data = await response.json();
        const user = data.rankings.find(
          (user: RankingUserProps) => user.name === userId,
        );
        setUser(user);
      } catch (error) {
        console.error("Error fetching rankings:", error);
      }
    };
    fetchRankings();
  }, [userId, user, setUser]);

  const handleButtonClick = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setDialogState("error");
      return;
    }
    setDialogState("confirm");
  };

  const handleTransaction = async () => {
    setDialogState("loading");

    try {
      await runTransaction();
      setDialogState(
        actionType === "deposit" ? "depositResult" : "withdrawResult",
      );
    } catch (error) {
      console.error(error);
      setDialogState("error");
    }
  };

  const resetDialog = () => {
    setDialogState("none");
  };

  return (
    <div className="relative">
      {/* Button to start the process */}
      <Button variant="standard" className="w-full" onClick={handleButtonClick}>
        {actionType}
      </Button>

      {/* Confirm Dialog */}
      {dialogState === "confirm" && (
        <AlertDialog open onOpenChange={() => setDialogState("none")}>
          <AlertDialogContent className="mx-auto w-[335px] rounded-2xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                Are you sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="body text-left">
                {`You are about to ${actionType} ${amount} SOL.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row items-center justify-end space-x-[10px]">
              <AlertDialogCancel onClick={() => setDialogState("none")}>
                Cancel
              </AlertDialogCancel>
              <Button onClick={handleTransaction}>Continue</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Loading Dialog */}
      {dialogState === "loading" && (
        <AlertDialog open onOpenChange={() => setDialogState("none")}>
          <AlertDialogContent
            style={{
              margin: "unset",
              padding: "unset",
              border: "unset",
              borderRadius: "12px",
            }}
          >
            <div className="flex flex-col items-center">
              <Loading />
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* DepositResult Dialog */}
      {dialogState === "depositResult" && (
        <AlertDialog open onOpenChange={() => setDialogState("none")}>
          <AlertDialogContent
            style={{
              margin: "unset",
              padding: "unset",
              border: "unset",
              borderRadius: "12px",
            }}
          >
            <PopupResultDeposit resetDialog={resetDialog} user={user} />
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* WithdrawResult Dialog */}
      {dialogState === "withdrawResult" && (
        <AlertDialog open onOpenChange={() => setDialogState("none")}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center">
                Withdrawal has been completed.
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex w-full flex-row items-center">
              <Button
                size="M"
                onClick={() => setDialogState("none")}
                className="w-full"
              >
                OK
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Error Dialog */}
      {dialogState === "error" && (
        <AlertDialog open onOpenChange={() => setDialogState("none")}>
          <AlertDialogContent className="mx-auto w-[335px] rounded-2xl p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-left">
                Transaction Failed
              </AlertDialogTitle>
              <AlertDialogDescription className="body text-left">
                Please ensure all fields are valid and your wallet is connected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-row items-center justify-end space-x-[10px]">
              <Button onClick={() => setDialogState("none")}>Close</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}