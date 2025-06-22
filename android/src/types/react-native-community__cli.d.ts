declare module '@react-native-community/cli' {
    export interface CLIOptions {
        command: string;
        args: string[];
    }

    export function runCLI(options: CLIOptions): Promise<void>;
}