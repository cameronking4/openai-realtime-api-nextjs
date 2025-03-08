import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/_components/ui/accordion"
import { Card, CardContent, CardTitle } from "@/app/_components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/app/_components/ui/table"
import { useTranslations } from "@/app/_components/shared/translations-context"
import { Message } from "@/app/_types"

interface TokenUsageDisplayProps {
  messages: Message[]
}

export function TokenUsageDisplay({ messages }: TokenUsageDisplayProps) {
  const { t } = useTranslations();
  return (
    <>
    { messages.length > 0 && (
    <Accordion type="single" collapsible key="token-usage" className="w-full">
      <AccordionItem value="token-usage">
        <AccordionTrigger>
          <CardTitle className="text-sm font-medium">{t('tokenUsage.usage')}</CardTitle>
        </AccordionTrigger>
        <AccordionContent>
          <Card>
            <CardContent>
              <div className="space-y-1 mt-4">
                {messages
                  .filter((msg) => msg.type === 'response.done')
                  .slice(-1)
                  .map((msg) => {
                    const tokenData = [
                      { label: t('tokenUsage.total'), value: msg.response?.usage?.total_tokens },
                      { label: t('tokenUsage.input'), value: msg.response?.usage?.input_tokens }, 
                      { label: t('tokenUsage.output'), value: msg.response?.usage?.output_tokens }
                    ];

                    return (
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
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
    )
  }
  </>
  )
} 