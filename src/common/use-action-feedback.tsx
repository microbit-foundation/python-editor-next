import { ReactNode } from "react";
import { Link, useToast } from "@chakra-ui/react";
import { useMemo } from "react";
import config from "../config";
import { useLogging } from "../logging/logging-hooks";
import { Logging } from "../logging/logging";

export class ActionFeedback {
  constructor(
    private toast: ReturnType<typeof useToast>,
    private logging: Logging
  ) {}

  closeAll() {
    this.toast.closeAll();
  }

  /**
   * Handles an error.
   */
  expectedError({
    title,
    description,
    error,
  }: {
    title: string;
    description: ReactNode;
    error?: any;
  }) {
    this.toast({
      title,
      status: "error",
      description,
      position: "top",
      isClosable: true,
      variant: "toast"
    });
  }

  /**
   * Handles an warning.
   */
  warning({
    title,
    description,
    error,
  }: {
    title: string;
    description: ReactNode;
    error?: any;
  }) {
    this.toast({
      title,
      status: "warning",
      description,
      position: "top",
      isClosable: true,
      variant: "toast"
    });
  }

  /**
   * Handles an warning.
   */
  success({ title, description }: { title: string; description?: ReactNode }) {
    this.toast({
      title,
      status: "success",
      description,
      position: "top",
      isClosable: false,
      duration: 2000, // Quicker than for errors,
      variant: "toast"
    });
  }

  /**
   * Handles an unexpected error for which we can provide no good context or text.
   * @param error the error thrown.
   */
  unexpectedError(error: Error) {
    this.logging.error(error);
    this.toast({
      title: "An unexpected error occurred",
      status: "error",
      description: (
        <>
          Please try again or{" "}
          <Link
            href={config.supportLink}
            target="_blank"
            rel="noopener"
            textDecoration="underline"
          >
            raise a support request
          </Link>
          .
        </>
      ),
      position: "top",
      isClosable: true,
    });
  }
}

/**
 * Access to global notification UI for action feedback.
 */
const useActionFeedback = () => {
  const toast = useToast();
  const logging = useLogging();
  return useMemo(() => new ActionFeedback(toast, logging), [toast, logging]);
};

export default useActionFeedback;
