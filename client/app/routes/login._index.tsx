import { Form } from "@remix-run/react"

export default function Login(){
    return <>
        <div className="l-main">
            <div className="title">MULTIRIS</div>
            <Form method="post" action="/?index">
                <input type="text" name="login" id="" />
                <button>Play</button>
            </Form>
        </div>
    </>
}