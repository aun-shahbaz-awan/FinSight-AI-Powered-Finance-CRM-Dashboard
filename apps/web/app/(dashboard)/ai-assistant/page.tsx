'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { askDashboardQuestion, getMyAiLogs } from '@/features/ai/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AiResponse } from '@/components/ai-response';

export default function AiAssistantPage() {
  const [question, setQuestion] = useState('');

  const { data: logs } = useQuery({
    queryKey: ['ai-logs'],
    queryFn: getMyAiLogs,
  });

  const askMutation = useMutation({
    mutationFn: () => askDashboardQuestion({ question }),
    onSuccess: () => {
      setQuestion('');
    },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">AI Assistant</h1>
          <p className="text-muted-foreground">
            Ask operational questions about clients, transactions, KYC, and tickets.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard Q&A</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: How many pending withdrawals and urgent tickets do we currently have?"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={5}
            />

            <Button
              disabled={!question || askMutation.isPending}
              onClick={() => askMutation.mutate()}
            >
              {askMutation.isPending ? 'Thinking...' : 'Ask AI'}
            </Button>

            {askMutation.data?.answer ? (
              <AiResponse content={askMutation.data.answer} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent AI Activity</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {logs?.length ? (
            logs.map((log: any) => (
              <div key={log.id} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{log.action}</p>
                <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                  {log.response}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No AI activity yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
