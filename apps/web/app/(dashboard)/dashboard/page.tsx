import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  
  const stats = [
    {
      label: 'Total Clients',
      value: '1,248',
    },
    {
      label: 'Pending KYC',
      value: '86',
    },
    {
      label: 'Deposits',
      value: '$248,500',
    },
    {
      label: 'Open Tickets',
      value: '34',
    },
  ];
  
  export default function DashboardPage() {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of client activity, KYC, transactions, and support.
          </p>
        </div>
  
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }