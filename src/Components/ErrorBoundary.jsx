import React, { Component } from "react";
import { toast } from "react-hot-toast";

class ErrorBoundary extends Component {
  state = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
    toast.error("An error occurred while handling images. Please try again.");
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg my-4">
          <p className="font-semibold">Something went wrong with image uploading.</p>
          <p>Please try again or contact support if the issue persists.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;