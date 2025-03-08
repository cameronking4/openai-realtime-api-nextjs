"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";
import { Terminal, MessageSquare } from "lucide-react";
import { useTranslations } from "@/app/_components/shared/translations-context";
import { Message as MessageType } from "@/app/_types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/_components/ui/accordion";

function FilterControls({
  typeFilter,
  setTypeFilter,
  searchQuery,
  setSearchQuery,
  messageTypes,
  messages,
}: {
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  messageTypes: string[];
  messages: MessageType[];
}) {
  const { t } = useTranslations();

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t('messageControls.filter')} />
          </SelectTrigger>
          <SelectContent>
            {messageTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder={t('messageControls.search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>
      <Button variant="outline" onClick={() => console.log(messages)} className="w-full">
        <Terminal className="h-4 w-4 mr-2" />
        {t('messageControls.log')}
      </Button>
    </div>
  );
}

export function SidePanelLogs({ msgs = [] }: { msgs?: MessageType[] }) {
  const { t } = useTranslations();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [allMessages, setAllMessages] = useState<MessageType[]>([]);
  
  // Store messages in state to keep them after session ends
  useEffect(() => {
    if (msgs.length > 0) {
      // Append new messages to existing ones
      setAllMessages(prevMsgs => {
        // Check if the last message is already in the list to avoid duplicates
        if (prevMsgs.length > 0 && msgs.length > 0) {
          const lastExistingMsg = JSON.stringify(prevMsgs[prevMsgs.length - 1]);
          const lastNewMsg = JSON.stringify(msgs[msgs.length - 1]);
          
          if (lastExistingMsg === lastNewMsg) {
            // If the last message is the same, just return the current messages
            return prevMsgs;
          }
        }
        
        // Otherwise append the new messages
        return [...prevMsgs, ...msgs];
      });
    }
  }, [msgs]);

  // Get unique message types
  const messageTypes = ["all", ...new Set(allMessages.map(msg => msg.type))];

  // Filter messages based on type and search query
  const filteredMsgs = allMessages.filter(msg => {
    const matchesType = typeFilter === "all" || msg.type === typeFilter;
    const matchesSearch = searchQuery === "" || 
      JSON.stringify(msg).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="logs">
        <AccordionTrigger className="text-sm font-medium">
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('sidePanel.logs')}
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 p-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  {t('messageControls.view')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-full p-4 mx-auto overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('messageControls.logs')}</DialogTitle>
                </DialogHeader>
                <FilterControls
                  typeFilter={typeFilter}
                  setTypeFilter={setTypeFilter}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  messageTypes={messageTypes}
                  messages={filteredMsgs}
                />
                <div className="mt-4">
                  <ScrollArea className="h-[70vh]">
                    <Table className="max-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('messageControls.type')}</TableHead>
                          <TableHead>{t('messageControls.content')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMsgs.map((msg, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{msg.type}</TableCell>
                            <TableCell className="font-mono text-sm whitespace-pre-wrap break-words max-w-full">
                              {JSON.stringify(msg, null, 2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>
            
            {allMessages.length > 0 ? (
              <div className="text-xs text-muted-foreground">
                {allMessages.length} messages recorded
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                No messages recorded yet
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 