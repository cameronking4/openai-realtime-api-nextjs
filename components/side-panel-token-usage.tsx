"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useTranslations } from "@/components/translations-context"
import { useTokenContext } from "../contexts/token-context"
import { Separator } from "@/components/ui/separator";

// Cost rates per 1 million tokens
const INPUT_COST_RATE = 40; // $40 per 1 million tokens
const OUTPUT_COST_RATE = 80; // $80 per 1 million tokens

export function SidePanelTokenUsage() {
  const { t } = useTranslations();
  const { tokenUsage } = useTokenContext();

  if (!tokenUsage) {
    return (
      <div className="text-sm text-muted-foreground">
        {t('tokenUsage.noData')}
      </div>
    );
  }

  // Calculate costs
  const inputCost = (tokenUsage.input_tokens / 1000000) * INPUT_COST_RATE;
  const outputCost = (tokenUsage.output_tokens / 1000000) * OUTPUT_COST_RATE;
  const totalCost = inputCost + outputCost;

  // Format costs to 6 decimal places
  const formatCost = (cost: number) => `$${cost.toFixed(6)}`;

  const tokenData = [
    { label: t('tokenUsage.total'), value: tokenUsage.total_tokens },
    { label: t('tokenUsage.input'), value: tokenUsage.input_tokens }, 
    { label: t('tokenUsage.output'), value: tokenUsage.output_tokens }
  ];

  const costData = [
    { label: t('tokenUsage.inputCost'), value: formatCost(inputCost) },
    { label: t('tokenUsage.outputCost'), value: formatCost(outputCost) },
    { label: t('tokenUsage.totalCost'), value: formatCost(totalCost) }
  ];

  return (
    <Accordion type="single" collapsible defaultValue="token-usage" className="w-full">
      <AccordionItem value="token-usage">
        <AccordionTrigger>
          <CardTitle className="text-sm font-medium">{t('tokenUsage.usage')}</CardTitle>
        </AccordionTrigger>
        <AccordionContent>
          <Card>
            <CardContent>
              <div className="space-y-4 mt-4">
                <Table key="token-usage-table">
                  <TableBody>
                    {tokenData.map(({label, value}) => (
                      <TableRow key={label}>
                        <TableCell className="font-medium motion-preset-focus">{label}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <Separator className="my-2" />
                
                <div className="text-sm font-medium">{t('tokenUsage.cost')}</div>
                <Table key="cost-table">
                  <TableBody>
                    {costData.map(({label, value}) => (
                      <TableRow key={label}>
                        <TableCell className="font-medium motion-preset-focus">{label}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 