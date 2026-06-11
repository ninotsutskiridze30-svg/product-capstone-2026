"use client";

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    void error;
    void errorInfo;
  }

  private reset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <Card className="mx-auto mt-10 max-w-lg">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            We could not render this section. Please try again.
          </p>
          <Button onClick={this.reset}>Try again</Button>
        </CardContent>
      </Card>
    );
  }
}
