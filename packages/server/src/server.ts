import express, {
  Application,
  NextFunction,
  Request,
  Response,
  ErrorRequestHandler,
} from "express";
import cors from "cors";
import logger from "morgan";
import createError from "http-errors";

/** Express application */
const app: Application = express();

/** Middleware */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));
app.use(cors());

/** Catch 404 and pass it to error handler */
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createError(404));
});

/** Error handler */
const handleError: ErrorRequestHandler = (err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
};
app.use(handleError);

export default app;
